package com.subwayggul;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.pm.ServiceInfo;
import android.location.Location;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;

import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * Arrival alarm that keeps running after the app is closed: a location foreground service that
 * alerts once the rider reaches the stop before the destination, and again on arrival.
 * The web app hands over everything it needs (coordinates and already-localized texts) in one JSON config.
 */
public class ArrivalAlarmService extends Service {
    static final String ACTION_START = "com.subwayggul.arrival.START";
    static final String ACTION_STOP = "com.subwayggul.arrival.STOP";
    static final String EXTRA_CONFIG = "config";
    static final String PREFS = "arrival_alarm";

    private static final String TRACKING_CHANNEL = "arrival-tracking";
    private static final String ALERT_CHANNEL = "arrival-alert";
    private static final int TRACKING_ID = 41001;
    private static final int ALERT_ID = 41002;
    private static final long MAX_AGE_MS = 3 * 60 * 60 * 1000L;
    private static final long INTERVAL_MS = 5000;
    /** Cell-tower fixes vaguer than this can't tell neighbouring stations apart. */
    private static final float IGNORE_ACCURACY_METERS = 2000;
    private static final double ARRIVED_METERS = 300;
    /** Used only when the stop before the destination isn't known. */
    private static final double APPROACH_METERS = 1200;
    private static final long[] VIBRATION = {0, 400, 200, 400, 200, 800};

    private static final class ApproachPoint {
        double lat;
        double lng;
        double radius;
        String title;
        String body;
    }

    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable expire = this::finish;
    private FusedLocationProviderClient client;
    private LocationCallback callback;

    private long armedAt;
    private String stage = "armed";
    private double targetLat;
    private double targetLng;
    /** Past this distance to the destination the rider has passed the previous stop even if no fix landed there. */
    private double passedMeters = APPROACH_METERS;
    private final List<ApproachPoint> approach = new ArrayList<>();
    private String trackingTitle;
    private String trackingBody;
    private String cancelLabel;
    private String approachTitle;
    private String approachBody;
    private String arrivalTitle;
    private String arrivalBody;
    private String trackingChannelName;
    private String alertChannelName;

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null || ACTION_STOP.equals(intent.getAction())) {
            finish();
            return START_NOT_STICKY;
        }
        try {
            configure(new JSONObject(intent.getStringExtra(EXTRA_CONFIG)));
        } catch (JSONException | NullPointerException error) {
            finish();
            return START_NOT_STICKY;
        }
        createChannels();
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(TRACKING_ID, trackingNotification(), ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
            } else {
                startForeground(TRACKING_ID, trackingNotification());
            }
        } catch (Exception error) {
            finish();
            return START_NOT_STICKY;
        }
        long remaining = armedAt + MAX_AGE_MS - System.currentTimeMillis();
        if (remaining <= 0) {
            finish();
            return START_NOT_STICKY;
        }
        saveState(true);
        handler.removeCallbacks(expire);
        handler.postDelayed(expire, remaining);
        requestUpdates();
        return START_REDELIVER_INTENT;
    }

    private void configure(JSONObject config) throws JSONException {
        long nextArmedAt = config.getLong("armedAt");
        SharedPreferences prefs = getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        // A redelivered start after the system restarted the service keeps the stage already reached.
        stage = prefs.getLong("armedAt", 0) == nextArmedAt ? prefs.getString("stage", "armed") : "armed";
        armedAt = nextArmedAt;

        JSONObject target = config.getJSONObject("target");
        targetLat = target.getDouble("lat");
        targetLng = target.getDouble("lng");

        approach.clear();
        double nearestGap = Double.MAX_VALUE;
        JSONArray points = config.optJSONArray("approach");
        for (int i = 0; points != null && i < points.length(); i++) {
            JSONObject item = points.getJSONObject(i);
            ApproachPoint point = new ApproachPoint();
            point.lat = item.getDouble("lat");
            point.lng = item.getDouble("lng");
            double gap = distance(point.lat, point.lng, targetLat, targetLng);
            point.radius = Math.max(250, Math.min(700, gap * 0.45));
            point.title = item.getString("title");
            point.body = item.getString("body");
            approach.add(point);
            nearestGap = Math.min(nearestGap, gap);
        }
        if (!approach.isEmpty()) passedMeters = Math.min(APPROACH_METERS, nearestGap * 0.7);

        JSONObject texts = config.getJSONObject("texts");
        trackingTitle = texts.getString("trackingTitle");
        trackingBody = texts.getString("trackingBody");
        cancelLabel = texts.getString("cancel");
        approachTitle = texts.getString("approachTitle");
        approachBody = texts.getString("approachBody");
        arrivalTitle = texts.getString("arrivalTitle");
        arrivalBody = texts.getString("arrivalBody");
        trackingChannelName = texts.getString("trackingChannel");
        alertChannelName = texts.getString("alertChannel");
    }

    private void requestUpdates() {
        if (
            ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
            ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED
        ) {
            finish();
            return;
        }
        if (client == null) client = LocationServices.getFusedLocationProviderClient(this);
        if (callback != null) client.removeLocationUpdates(callback);
        callback = new LocationCallback() {
            @Override
            public void onLocationResult(LocationResult result) {
                Location location = result.getLastLocation();
                if (location != null) onLocation(location);
            }
        };
        LocationRequest request = new LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, INTERVAL_MS)
            .setMinUpdateIntervalMillis(2000)
            .build();
        try {
            client.requestLocationUpdates(request, callback, Looper.getMainLooper());
        } catch (SecurityException error) {
            finish();
        }
    }

    private void onLocation(Location location) {
        if (location.hasAccuracy() && location.getAccuracy() > IGNORE_ACCURACY_METERS) return;
        double lat = location.getLatitude();
        double lng = location.getLongitude();
        double toTarget = distance(lat, lng, targetLat, targetLng);
        if (toTarget <= ARRIVED_METERS) {
            stage = "arrived";
            alert(arrivalTitle, arrivalBody);
            finish();
            return;
        }
        if (!"armed".equals(stage)) return;
        for (ApproachPoint point : approach) {
            if (distance(lat, lng, point.lat, point.lng) <= point.radius) {
                markApproaching(point.title, point.body);
                return;
            }
        }
        if (toTarget <= passedMeters) markApproaching(approachTitle, approachBody);
    }

    private void markApproaching(String title, String body) {
        stage = "approaching";
        saveState(true);
        alert(title, body);
    }

    private void alert(String title, String body) {
        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager != null) {
            Notification notification = new NotificationCompat.Builder(this, ALERT_CHANNEL)
                .setSmallIcon(R.drawable.ic_stat_alarm)
                .setColor(0xFFF5B800)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setVibrate(VIBRATION)
                .setDefaults(NotificationCompat.DEFAULT_SOUND)
                .setAutoCancel(true)
                .setContentIntent(openAppIntent())
                .build();
            manager.notify(ALERT_ID, notification);
        }
        vibrate();
    }

    private void vibrate() {
        Vibrator vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        if (vibrator == null || !vibrator.hasVibrator()) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createWaveform(VIBRATION, -1));
        } else {
            vibrator.vibrate(VIBRATION, -1);
        }
    }

    private Notification trackingNotification() {
        Intent stop = new Intent(this, ArrivalAlarmService.class).setAction(ACTION_STOP);
        PendingIntent stopIntent = PendingIntent.getService(
            this, 1, stop, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
        );
        return new NotificationCompat.Builder(this, TRACKING_CHANNEL)
            .setSmallIcon(R.drawable.ic_stat_alarm)
            .setColor(0xFFF5B800)
            .setContentTitle(trackingTitle)
            .setContentText(trackingBody)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setContentIntent(openAppIntent())
            .addAction(0, cancelLabel, stopIntent)
            .build();
    }

    private PendingIntent openAppIntent() {
        Intent launch = getPackageManager().getLaunchIntentForPackage(getPackageName());
        if (launch == null) launch = new Intent(this, MainActivity.class);
        launch.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(this, 0, launch, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    private void createChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager == null) return;
        NotificationChannel tracking = new NotificationChannel(
            TRACKING_CHANNEL, trackingChannelName, NotificationManager.IMPORTANCE_LOW
        );
        tracking.setShowBadge(false);
        manager.createNotificationChannel(tracking);
        NotificationChannel alerts = new NotificationChannel(
            ALERT_CHANNEL, alertChannelName, NotificationManager.IMPORTANCE_HIGH
        );
        alerts.enableVibration(true);
        alerts.setVibrationPattern(VIBRATION);
        alerts.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
        manager.createNotificationChannel(alerts);
    }

    private void saveState(boolean active) {
        getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putBoolean("active", active)
            .putString("stage", stage)
            .putLong("armedAt", armedAt)
            .apply();
    }

    private void finish() {
        handler.removeCallbacks(expire);
        if (client != null && callback != null) client.removeLocationUpdates(callback);
        callback = null;
        if (armedAt != 0) saveState(false);
        stopForeground(STOP_FOREGROUND_REMOVE);
        stopSelf();
    }

    @Override
    public void onDestroy() {
        handler.removeCallbacks(expire);
        if (client != null && callback != null) client.removeLocationUpdates(callback);
        callback = null;
        if (armedAt != 0) saveState(false);
        super.onDestroy();
    }

    private static double distance(double lat1, double lng1, double lat2, double lng2) {
        float[] result = new float[1];
        Location.distanceBetween(lat1, lng1, lat2, lng2, result);
        return result[0];
    }
}

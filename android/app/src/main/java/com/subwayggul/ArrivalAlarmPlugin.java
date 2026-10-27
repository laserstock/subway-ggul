package com.subwayggul;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

/** Bridge between the web app and ArrivalAlarmService. */
@CapacitorPlugin(
    name = "ArrivalAlarm",
    permissions = {
        @Permission(
            alias = "location",
            strings = { Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION }
        )
    }
)
public class ArrivalAlarmPlugin extends Plugin {

    /** Approximate location is enough to tell stations apart, so only the coarse grant is required. */
    private boolean hasLocation() {
        return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_COARSE_LOCATION)
            == PackageManager.PERMISSION_GRANTED;
    }

    @PluginMethod
    public void start(PluginCall call) {
        if (hasLocation()) {
            startService(call);
        } else {
            requestPermissionForAlias("location", call, "afterLocationPermission");
        }
    }

    @PermissionCallback
    private void afterLocationPermission(PluginCall call) {
        if (hasLocation()) {
            startService(call);
        } else {
            call.reject("Location permission denied", "NOT_AUTHORIZED");
        }
    }

    private void startService(PluginCall call) {
        Intent intent = new Intent(getContext(), ArrivalAlarmService.class)
            .setAction(ArrivalAlarmService.ACTION_START)
            .putExtra(ArrivalAlarmService.EXTRA_CONFIG, call.getData().toString());
        try {
            ContextCompat.startForegroundService(getContext(), intent);
            call.resolve();
        } catch (Exception error) {
            call.reject("Could not start the arrival alarm", "UNAVAILABLE", error);
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        getContext().stopService(new Intent(getContext(), ArrivalAlarmService.class));
        getContext()
            .getSharedPreferences(ArrivalAlarmService.PREFS, Context.MODE_PRIVATE)
            .edit()
            .putBoolean("active", false)
            .apply();
        call.resolve();
    }

    @PluginMethod
    public void status(PluginCall call) {
        SharedPreferences prefs = getContext().getSharedPreferences(ArrivalAlarmService.PREFS, Context.MODE_PRIVATE);
        JSObject result = new JSObject();
        result.put("active", prefs.getBoolean("active", false));
        result.put("stage", prefs.getString("stage", "armed"));
        result.put("armedAt", prefs.getLong("armedAt", 0));
        call.resolve(result);
    }
}

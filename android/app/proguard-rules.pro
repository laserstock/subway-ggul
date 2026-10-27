# Capacitor finds plugins and their methods by reflection, so R8 must not rename or drop them.
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin public class * {
    @com.getcapacitor.annotation.PermissionCallback <methods>;
    @com.getcapacitor.annotation.ActivityCallback <methods>;
    @com.getcapacitor.PluginMethod public <methods>;
    *;
}
-keep public class * extends com.getcapacitor.Plugin { *; }
-keep class com.equimaps.capacitor_background_geolocation.** { *; }
-keep class com.capacitorjs.plugins.** { *; }
-keep class com.subwayggul.** { *; }

# Readable crash stack traces in Play Console (upload the mapping.txt R8 writes next to the bundle).
-keepattributes SourceFile,LineNumberTable,*Annotation*,Signature,InnerClasses,EnclosingMethod
-renamesourcefileattribute SourceFile

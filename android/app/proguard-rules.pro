# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Stack trace okunabilirliği için satır bilgisini koru.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# ─── Capacitor core + plugin'ler ───────────────────────────────────────────
# Capacitor JS bridge plugin sınıflarını @CapacitorPlugin annotation'dan
# bulduğu için class isimleri obfuscate edilmemeli.
-keep public class com.getcapacitor.** { *; }
-keep public class * extends com.getcapacitor.Plugin
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keepclassmembers class * {
    @com.getcapacitor.PluginMethod *;
    @com.getcapacitor.annotation.PluginMethod *;
}

# Cordova plugins (Capacitor'la birlikte gelen)
-keep class org.apache.cordova.** { *; }

# ─── Firebase / Google Play Services ──────────────────────────────────────
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# ─── WebView JS interface ─────────────────────────────────────────────────
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ─── Reflection-based JSON / Gson ──────────────────────────────────────────
-keep class com.google.gson.** { *; }
-keepattributes Signature
-keepattributes *Annotation*

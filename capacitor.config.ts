import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.kerimebalabanakademi.app',
  appName: 'Kerime Balaban Akademi',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#b7131a',
    },
    SplashScreen: {
      launchAutoHide: true,
      // Short fallback — JS calls SplashScreen.hide() in initCapacitor as
      // soon as the WebView is ready. This duration only kicks in if JS hangs.
      launchShowDuration: 200,
      // No androidScaleType — Android uses a layer-list drawable
      // (drawable/splash.xml) with @color bg + center-gravity bitmap, so
      // the default FIT_XY only stretches the solid bg color and leaves the
      // logo at native size.
      showSpinner: false,
    },
    Keyboard: {
      // 'native': iOS Safari'nin focus+scroll davranışını native handle eder.
      // 'body' eskiden vardı ama input scrollIntoView'da bug çıkarıyordu.
      resize: 'native',
      resizeOnFullScreen: true,
    },
  },
}

export default config

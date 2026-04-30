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
      launchShowDuration: 2000,
      backgroundColor: '#b7131a',
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

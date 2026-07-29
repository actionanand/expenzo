import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.actionanand.expenzo.app',
  appName: 'Expenzo',
  webDir: 'dist/expenzo/browser',
  server: {
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#f1f8e9',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      backgroundColor: '#0d1b0d',
      androidScaleType: 'CENTER_INSIDE',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;

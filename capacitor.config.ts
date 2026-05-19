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
};

export default config;

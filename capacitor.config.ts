import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.actionanand.expenzo.app',
  appName: 'Expenzo',
  webDir: 'dist/expenzo/browser',
  server: {
    androidScheme: 'https',
  },
};

export default config;

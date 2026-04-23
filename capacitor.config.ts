import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.moneytrack.app',
  appName: 'Money Track',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;

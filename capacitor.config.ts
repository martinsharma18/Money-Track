import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.moneytrack.app',
  appName: 'Trackify',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    LiveUpdates: {
      appId: '964f94fa',
      channel: 'Production',
      autoUpdateMethod: 'background'
    }
  }
};

export default config;

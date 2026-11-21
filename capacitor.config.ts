import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.footballdetective.app',
  appName: 'Football Detective',
  webDir: 'dist',
  backgroundColor: '#08170F',
  android: {
    backgroundColor: '#08170F',
  },
  plugins: {
    // Light icons on our dark bars. With no `viewport-fit=cover`, Capacitor pads the WebView
    // natively so content never sits under the status or navigation bar.
    SystemBars: {
      style: 'DARK',
      insetsHandling: 'css',
    },
  },
};

export default config;

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gloryephraim.medsafe',
  appName: 'MedSafe',
  // Vite's output folder - this gets copied into the Android app.
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    // Use the app's own icons in the launcher and splash screen.
    allowMixedContent: false
  }
};

export default config;

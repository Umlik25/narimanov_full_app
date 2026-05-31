import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'az.narimanov.ops',
  appName: 'City Grind',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;

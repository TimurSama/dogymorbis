/*
 * Dogymorbis app default configuration.
 * Use this file to centralize environment variables, API endpoints and feature flags.
 */

export const AppConfig = {
  appName: 'Dogymorbis',
  apiBaseUrl: 'https://api.dogymorbis.example',
  environment: 'development',
  theme: {
    primaryColor: '#F2E985',
    secondaryColor: '#8CB3FF',
    accentColor: '#F8C8DC',
    goldColor: '#FFD166'
  },
  // Feature flags to enable/disable modules
  features: {
    enableBoneCoin: true,
    enableARGames: true,
    enableAIHelper: true,
    enableDAO: true
  },
  // Default map settings
  map: {
    defaultZoom: 15,
    defaultLat: 52.3676, // Amsterdam latitude
    defaultLng: 4.9041  // Amsterdam longitude
  }
};

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ceyhallo.app', // MY_VALUE_BUNDLE_ID
  appName: 'CeyHallo', // MY_VALUE_APP_NAME
  webDir: 'www',
  plugins: {
    SocialLogin: {
      providers: {
        google: true,
        facebook: true,
        apple: true,
        twitter: false,
      },
      apple: {
        clientId: 'com.ceyhallo.app.signin',
      },
      facebook: {
        appId: '1273168304320582',
        clientToken: '446d552b822383774784d672ea6ebda5',
      },
      google: {
        iOSClientId: '253346274750-m3pvrbnti009lkdqnc05tfo835vs8g2g.apps.googleusercontent.com', // MY_VALUE_IOS_CLIENT_ID
        iOSServerClientId: '253346274750-2s39r743nn8qe887vbl55den44ej02v4.apps.googleusercontent.com', // MY_VALUE_IOS_SERVER_CLIENT_ID
        mode: 'online',
      },
    },
  },
};

export default config;

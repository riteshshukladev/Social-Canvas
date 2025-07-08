import * as SecureStore from 'expo-secure-store';

export const tokenCache = {
  async getToken(key:any) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key:any, value:any) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};
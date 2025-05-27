import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const STORAGE_DIRECTORY_URI_KEY = 'storage_directory_uri';

export const requestMediaLibraryPermission = async () => {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission Required', 'Sorry, we need media library permissions to save the PDF');
    return false;
  }
  return true;
};

export const getOrCreateStorageDirectory = async () => {
  try {
    let directoryUri = await AsyncStorage.getItem(STORAGE_DIRECTORY_URI_KEY);

    if (!directoryUri) {
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (permissions.granted) {
        await AsyncStorage.setItem(STORAGE_DIRECTORY_URI_KEY, permissions.directoryUri);
        directoryUri = permissions.directoryUri;
      } else {
        Alert.alert('Permission Denied', 'Unable to save document without storage access permission');
        return null;
      }
    }

    return directoryUri;
  } catch (error) {
    console.error('Error getting or creating storage directory:', error);
    return null;
  }
};

export const resetStorageDirectory = async () => {
  await AsyncStorage.removeItem(STORAGE_DIRECTORY_URI_KEY);
  Alert.alert('Success', 'Storage directory has been reset. You will be prompted to select a new location next time.');
};
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as MediaLibrary from 'expo-media-library';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateInvoiceHtml } from '@/templates/invoiceTemplate';
import { InvoiceType, UserType, CustomerType, BankDetailsType, WorkInformationType, PaymentType } from '@/db/zodSchema';

type GeneratePdfParams = {
  data: InvoiceType & {
    workItems: WorkInformationType[];
    payments: PaymentType[];
    user: UserType;
    customer: CustomerType;
    bankDetails: BankDetailsType;
    notes: string;
  };
  tax: number;
  subtotal: number;
  total: number;
  remainingBalance: number;
};


const STORAGE_DIRECTORY_URI_KEY = 'pdf_storage_directory_uri';

export const generateAndSavePdf = async (params: GeneratePdfParams) => {
  try {

    const { status } = await MediaLibrary.requestPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need media library permissions to save the PDF');
      return false;
    }

    const html = generateInvoiceHtml(params);
    const filename = `Invoice_${params.data.id}_${params.data.invoiceDate.toString().split('T')[0]}.pdf`;

    const { uri: tempUri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    if (Platform.OS === 'android') {
      await handleAndroidPdfSave(tempUri, filename);
    } else {
      await handleIosPdfSave(html, filename);
    }

    await cleanupTempFile(tempUri);

    Alert.alert(
      'Success',
      Platform.OS === 'android'
        ? 'PDF has been saved to your Downloads folder'
        : 'PDF has been shared'
    );

    return true;
  } catch (error) {
    console.error('Error generating or saving PDF:', error);
    Alert.alert('Error', `Failed to generate or save PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
};

const handleAndroidPdfSave = async (tempUri: string, filename: string) => {
  try {

    let directoryUri = await AsyncStorage.getItem(STORAGE_DIRECTORY_URI_KEY);

    if (!directoryUri) {
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (permissions.granted) {
        // Save the directory URI
        await AsyncStorage.setItem(STORAGE_DIRECTORY_URI_KEY, permissions.directoryUri);
        directoryUri = permissions.directoryUri;
      } else {
        Alert.alert('Permission Denied', 'Unable to save PDF without storage access permission');
        return;
      }
    }

    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(tempUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Create and write to the file
    const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
      directoryUri,
      filename,
      'application/pdf'
    );

    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

  } catch (error) {
    console.error('Error saving PDF on Android:', error);
    // If there's an error with the saved directory URI, clear it and try again next time
    if (error instanceof Error && error.message.includes('Permission denied')) {
      await AsyncStorage.removeItem(STORAGE_DIRECTORY_URI_KEY);
      Alert.alert(
        'Permission Error',
        'Please try saving again. You may need to select the folder again.'
      );
    } else {
      throw error;
    }
  }
};

const handleIosPdfSave = async (html: string, filename: string) => {
  const { uri } = await Print.printToFileAsync({ html });
  const pdfPath = `${FileSystem.cacheDirectory}${filename}`;

  await FileSystem.copyAsync({
    from: uri,
    to: pdfPath,
  });

  const isSharingAvailable = await Sharing.isAvailableAsync();

  if (isSharingAvailable) {
    await Sharing.shareAsync(pdfPath, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share Invoice PDF',
      UTI: 'com.adobe.pdf',
    });
  }

  await FileSystem.deleteAsync(uri, { idempotent: true });
  await FileSystem.deleteAsync(pdfPath, { idempotent: true });
};

const cleanupTempFile = async (tempUri: string) => {
  try {
    await FileSystem.deleteAsync(tempUri, { idempotent: true });
  } catch (error) {
    console.error('Error cleaning up temp file:', error);
  }
};

// Function to reset stored permissions
export const resetStoredDirectoryPermissions = async () => {
  await AsyncStorage.removeItem(STORAGE_DIRECTORY_URI_KEY);
  Alert.alert('Success', 'Directory permissions have been reset. You will be prompted to select a folder next time you save a PDF.');
};
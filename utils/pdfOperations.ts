import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Platform, Alert } from 'react-native';
import { generateInvoiceHtml } from '@/templates/invoiceTemplate';
import { InvoiceType, UserType, CustomerType, BankDetailsType, WorkInformationType, PaymentType } from '@/db/zodSchema';
import { requestMediaLibraryPermission, getOrCreateStorageDirectory, resetStorageDirectory } from './permissions';

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

export const generateAndSavePdf = async (params: GeneratePdfParams) => {
  try {
    if (!await requestMediaLibraryPermission()) {
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
    const directoryUri = await getOrCreateStorageDirectory();

    if (!directoryUri) {
      return;
    }

    const base64 = await FileSystem.readAsStringAsync(tempUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

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
    if (error instanceof Error && error.message.includes('Permission denied')) {
      await resetStorageDirectory();
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

export const resetStoredDirectoryPermissions = resetStorageDirectory;
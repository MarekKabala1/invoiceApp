import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as MediaLibrary from 'expo-media-library';
import { Platform, Alert } from 'react-native';
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
};

export const generateAndSavePdf = async (params: GeneratePdfParams) => {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need media library permissions to save the PDF');
      return false;
    }

    const html = generateInvoiceHtml(params);
    const filename = `Invoice_${params.data.id}_${new Date().toISOString().split('T')[0]}.pdf`;

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
        : 'PDF has been saved to your Photos app in the Invoices album'
    );

    return true;
  } catch (error) {
    console.error('Error generating or saving PDF:', error);
    Alert.alert('Error', `Failed to generate or save PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
};

const handleAndroidPdfSave = async (tempUri: string, filename: string) => {
  const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

  if (permissions.granted) {
    const base64 = await FileSystem.readAsStringAsync(tempUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await FileSystem.StorageAccessFramework.createFileAsync(
      permissions.directoryUri,
      filename,
      'application/pdf'
    ).then(async (uri) => {
      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
    });
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
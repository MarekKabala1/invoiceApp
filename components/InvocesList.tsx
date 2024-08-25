import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useInvoice } from '@/context/InvoiceContext';
import { Ionicons } from '@expo/vector-icons';

type InvoiceType = {
  id: string;
  customer_id: string;
  invoice_date: Date;
  due_date: Date;
  amount_before_tax: number;
  amount_after_tax: number;
};

const InvoiceItem = ({ item }: { item: InvoiceType }) => (
  <TouchableOpacity
    // onPress={() => router.push(`/invoice/${item.id}`)}
    className="bg-white p-4 mb-2 rounded-lg shadow-sm flex-row justify-between items-center"
  >
    <View>
      <Text className="font-bold text-lg">{item.customer_id}</Text>
      <Text className="text-gray-600">Due: {item.due_date.toLocaleDateString()}</Text>
    </View>
    <View className="flex-row items-center">
      <Text className="font-bold text-lg mr-2">${item.amount_after_tax.toFixed(2)}</Text>
      <Ionicons name="chevron-forward" size={24} color="#0284c7" />
    </View>
  </TouchableOpacity>
);

export default function AllInvoicesPage() {
  const router = useRouter();
  const { invoices } = useInvoice();

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <FlatList
        // data={invoices as InvoiceType[]} /
       data = {[{id: '1', customer_id: 'John Doe', invoice_date: new Date(), due_date: new Date(), amount_before_tax: 100, amount_after_tax: 120} , {id: '2', customer_id: 'Jane Doe', invoice_date: new Date(), due_date: new Date(), amount_before_tax: 100, amount_after_tax: 120}, {id: '3', customer_id: 'John Doe', invoice_date: new Date(), due_date: new Date(), amount_before_tax: 100, amount_after_tax: 120}]}
        renderItem={({ item }) => <InvoiceItem item={item} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-4">No invoices found</Text>
        }
      />
      <TouchableOpacity
        onPress={() => router.push('/createInvoice')}
        className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}
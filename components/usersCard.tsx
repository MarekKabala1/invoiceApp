import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { userSchema } from '@/db/zodSchema';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type User = z.infer<typeof userSchema>;

//ToDo:add functionalyty to updating and deleting data

export default function UsersCard({ users }: { users: User[] }) {
	return (
		<View>
			<FlatList
				data={users}
				renderItem={({ item }) => (
					<View className='bg-navLight p-4 mb-2 rounded-lg shadow-sm flex-row justify-between items-center'>
						<Text className='text-lg  text-textLight'>{item.fullName}</Text>
						<View className='flex-row gap-2'>
							<TouchableOpacity>
								<View className='bg-navLight border-2 border-textLight rounded-md text-textLight shadow-sm shadow-slate-400 p-2'>
									<MaterialCommunityIcons name='update' size={24} color='#253cad' />
								</View>
							</TouchableOpacity>
							<TouchableOpacity>
								<View className='bg-navLight border-2 border-danger rounded-md text-textLight shadow-sm shadow-slate-400 p-2'>
									<MaterialCommunityIcons name='delete-outline' size={24} color='#ef4444' />
								</View>
							</TouchableOpacity>
						</View>
					</View>
				)}
				keyExtractor={(item) => item.id}
			/>
		</View>
	);
}

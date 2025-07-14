import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	Modal,
	Alert,
	ScrollView,
	TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import BaseCard from './BaseCard';
import { db } from '@/db/config';
import { EstimateTerms } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from '@/utils/generateUuid';

const TermsAndConditionsCard: React.FC = () => {
	const [terms, setTerms] = useState<string[]>([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { colors } = useTheme();

	useEffect(() => {
		loadTerms();
	}, []);

	const loadTerms = async () => {
		try {
			const existingTerms = await db
				.select()
				.from(EstimateTerms)
				.where(eq(EstimateTerms.estimateId, 'global'));
			if (existingTerms.length > 0) {
				setTerms(existingTerms.map((term: any) => term.termText || ''));
			} else {
				setTerms([]);
			}
		} catch (error) {
			setTerms([]);
		}
	};

	const handleView = () => {
		setIsEditMode(false);
		setIsModalVisible(true);
	};

	const handleEdit = () => {
		setIsEditMode(true);
		setIsModalVisible(true);
	};

	const handleLongPressDelete = (index: number) => {
		Alert.alert(
			'Delete Term',
			`Are you sure you want to delete term ${index + 1}?`,
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: () => removeTerm(index),
				},
			]
		);
	};

	const addTerm = () => {
		setTerms([...terms, '']);
	};

	const removeTerm = (index: number) => {
		if (terms.length > 1) {
			const newTerms = terms.filter((_, i) => i !== index);
			setTerms(newTerms);
		}
	};

	const updateTerm = (index: number, value: string) => {
		const newTerms = [...terms];
		newTerms[index] = value;
		setTerms(newTerms);
	};

	const handleSave = async () => {
		const validTerms = terms.filter((term) => term.trim().length > 0);
		if (validTerms.length === 0) {
			Alert.alert('Error', 'Please add at least one term');
			return;
		}
		setIsLoading(true);
		try {
			await db.transaction(async (tx) => {
				await tx
					.delete(EstimateTerms)
					.where(eq(EstimateTerms.estimateId, 'global'));
				for (const termText of validTerms) {
					if (termText.trim()) {
						const termId = await generateId();
						await tx.insert(EstimateTerms).values({
							id: termId,
							estimateId: 'global',
							termText: termText.trim(),
						});
					}
				}
			});
			Alert.alert('Success', 'Terms and conditions saved successfully');
			setIsModalVisible(false);
			setIsEditMode(false);
			loadTerms();
		} catch (error) {
			Alert.alert('Error', 'Failed to save terms and conditions');
		} finally {
			setIsLoading(false);
		}
	};

	const previewText =
		terms.length > 0
			? terms
					.slice(0, 2)
					.map(
						(term, index) =>
							`${index + 1}. ${term.substring(0, 50)}${term.length > 50 ? '...' : ''}`
					)
					.join('\n')
			: 'No terms and conditions set';

	return (
		<>
			<BaseCard className='p-4'>
				<View className='flex-row items-center gap-4'>
					<View className='bg-light-text dark:bg-dark-primary rounded-xl shadow-md p-3'>
						<Ionicons name='document-text-outline' size={32} color='#f1fcfa' />
					</View>
					<View className='flex-1'>
						<Text className='text-lg font-bold text-light-text dark:text-dark-text'>
							Terms & Conditions
						</Text>
						<Text className='text-sm text-light-text/80 dark:text-dark-text/80 mb-2'>
							{terms.length > 0
								? `${terms.length} term${terms.length > 1 ? 's' : ''} set`
								: 'No terms set'}
						</Text>
						<Text
							className='text-xs text-light-text/60 dark:text-dark-text/60'
							numberOfLines={3}>
							{previewText}
						</Text>
					</View>
				</View>
				<View className='flex-row justify-end mt-4 gap-2'>
					<TouchableOpacity
						onPress={handleView}
						className='flex-row items-center bg-primary px-3 py-2 rounded-lg'>
						<Ionicons name='eye-outline' size={16} color={colors.text} />
						<Text className='text-light-text dark:text-dark-text ml-1 text-sm font-medium'>
							View
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={handleEdit}
						className='flex-row items-center bg-blue-500 px-3 py-2 rounded-lg'>
						<Ionicons name='create-outline' size={16} color='white' />
						<Text className='text-white ml-1 text-sm font-medium'>Edit</Text>
					</TouchableOpacity>
				</View>
			</BaseCard>
			<Modal
				visible={isModalVisible}
				animationType='slide'
				onRequestClose={() => setIsModalVisible(false)}>
				<View className='flex-1 bg-light-primary dark:bg-dark-primary'>
					<View className='flex-1 p-4'>
						<View className='flex-row items-center justify-between mb-6'>
							<Text className='text-2xl font-bold text-light-text dark:text-dark-text'>
								{isEditMode ? 'Edit Terms & Conditions' : 'Terms & Conditions'}
							</Text>
							<TouchableOpacity onPress={() => setIsModalVisible(false)}>
								<Ionicons name='close' size={24} color={colors.text} />
							</TouchableOpacity>
						</View>
						<ScrollView className='flex-1'>
							{isEditMode ? (
								<>
									{terms.map((term, index) => (
										<TouchableOpacity
											key={index}
											onLongPress={() => handleLongPressDelete(index)}
											activeOpacity={0.8}
											className='mb-4'>
											<View className='flex-row items-center mb-2'>
												<Text className='text-sm font-semibold text-light-text dark:text-dark-text mr-2'>
													Term {index + 1}
												</Text>
												<View className='flex-row items-center'>
													<Ionicons
														name='trash-outline'
														size={16}
														color={colors.text + '40'}
													/>
													<Text className='text-xs text-light-text/40 dark:text-dark-text/40 ml-1'>
														Long press to delete
													</Text>
												</View>
											</View>
											<TextInput
												value={term}
												onChangeText={(value) => updateTerm(index, value)}
												placeholder='Enter term text...'
												multiline
												numberOfLines={4}
												className='border border-light-text/20 dark:border-dark-text/20 rounded-lg p-3 text-light-text dark:text-dark-text bg-light-primary dark:bg-dark-primary'
												placeholderTextColor={colors.text + '80'}
											/>
										</TouchableOpacity>
									))}
									<TouchableOpacity
										onPress={handleSave}
										disabled={isLoading}
										className='bg-primary p-4 rounded-lg'>
										<Text className='text-center text-light-text dark:text-dark-text font-semibold text-lg'>
											{isLoading ? 'Saving...' : 'Save Terms & Conditions'}
										</Text>
									</TouchableOpacity>
								</>
							) : (
								<View>
									{terms.length > 0 ? (
										terms.map((term, index) => (
											<TouchableOpacity
												key={index}
												onLongPress={() => handleLongPressDelete(index)}
												activeOpacity={0.8}
												className='mb-4 p-4 bg-light-nav dark:bg-dark-nav rounded-lg'>
												<View className='flex-row items-center justify-between mb-2'>
													<Text className='text-sm font-semibold text-light-text dark:text-dark-text'>
														Term {index + 1}
													</Text>
													<View className='flex-row items-center'>
														<Ionicons
															name='trash-outline'
															size={16}
															color={colors.text + '40'}
														/>
														<Text className='text-xs text-light-text/40 dark:text-dark-text/40 ml-1'>
															Long press to delete
														</Text>
													</View>
												</View>
												<Text className='text-light-text dark:text-dark-text leading-5'>
													{term}
												</Text>
											</TouchableOpacity>
										))
									) : (
										<View className='items-center justify-center p-8'>
											<Ionicons
												name='document-text-outline'
												size={64}
												color={colors.text + '40'}
											/>
											<Text className='text-light-text dark:text-dark-text text-center mt-4 opacity-60'>
												No terms and conditions set
											</Text>
										</View>
									)}
								</View>
							)}
						</ScrollView>
					</View>
				</View>
			</Modal>
		</>
	);
};

export default TermsAndConditionsCard;

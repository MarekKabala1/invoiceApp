import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	SafeAreaView,
	TouchableOpacity,
	TextInput,
	ScrollView,
	Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { db } from '@/db/config';
import { EstimateTerms } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { EstimateTermsType } from '@/db/zodSchema';
import { generateId } from '@/utils/generateUuid';

interface TermsAndConditionsProps {
	isGlobal?: boolean;
	estimateId?: string;
	onClose?: () => void;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({
	isGlobal = true,
	estimateId,
	onClose,
}) => {
	const [terms, setTerms] = useState<string[]>(['']);
	const [isLoading, setIsLoading] = useState(false);
	const { colors } = useTheme();

	useEffect(() => {
		loadTerms();
	}, [isGlobal, estimateId]);

	const loadTerms = async () => {
		try {
			const targetId = isGlobal ? 'global' : estimateId;
			if (!targetId) return;

			const existingTerms = await db
				.select()
				.from(EstimateTerms)
				.where(eq(EstimateTerms.estimateId, targetId));

			if (existingTerms.length > 0) {
				setTerms(existingTerms.map((term: any) => term.termText || ''));
			} else {
				setTerms(['']);
			}
		} catch (error) {
			console.error('Error loading terms:', error);
			setTerms(['']);
		}
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

		const targetId = isGlobal ? 'global' : estimateId;
		if (!targetId) {
			Alert.alert('Error', 'No target ID specified');
			return;
		}

		setIsLoading(true);
		try {
			await db.transaction(async (tx) => {
				await tx
					.delete(EstimateTerms)
					.where(eq(EstimateTerms.estimateId, targetId));

				for (const termText of validTerms) {
					if (termText.trim()) {
						const termId = await generateId();
						await tx.insert(EstimateTerms).values({
							id: termId,
							estimateId: targetId,
							termText: termText.trim(),
						});
					}
				}
			});
			Alert.alert('Success', 'Terms and conditions saved successfully');
			if (onClose) {
				onClose();
			}
		} catch (error) {
			console.error('Error saving terms:', error);
			Alert.alert('Error', 'Failed to save terms and conditions');
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		if (isLoading) return;
		if (onClose) {
			onClose();
		} else {
			router.back();
		}
	};

	const title = isGlobal ? 'Terms & Conditions' : 'Estimate Terms & Conditions';
	const description = isGlobal
		? 'Manage your global terms and conditions. These will be available as templates when creating estimates.'
		: 'Add terms and conditions for this estimate. These will be included in the estimate PDF.';

	return (
		<SafeAreaView className='flex-1 bg-light-primary dark:bg-dark-primary'>
			<View className='flex-1 p-4'>
				<View className='flex-row items-center mb-6'>
					<Text className='text-2xl font-bold text-light-text dark:text-dark-text'>
						{title}
					</Text>
				</View>

				<ScrollView className='flex-1'>
					<Text className='text-sm text-light-text dark:text-dark-text mb-6 opacity-70'>
						{description}
					</Text>

					{terms.map((term, index) => (
						<View key={index} className='mb-4'>
							<View className='flex-row items-center mb-2'>
								<Text className='text-sm font-semibold text-light-text dark:text-dark-text mr-2'>
									Term {index + 1}
								</Text>
								{terms.length > 1 && (
									<TouchableOpacity
										onPress={() => removeTerm(index)}
										className='ml-auto'>
										<Ionicons
											name='trash-outline'
											size={20}
											color={colors.danger}
										/>
									</TouchableOpacity>
								)}
							</View>
							<TextInput
								value={term}
								onChangeText={(value) => updateTerm(index, value)}
								placeholder='Enter term text...'
								multiline
								numberOfLines={4}
								className='border border-light-text/20 dark:border-dark-text/20 rounded-lg p-3 text-light-text dark:text-dark-text bg-light- dark:bg-dark-primary'
								placeholderTextColor={colors.text + '80'}
							/>
						</View>
					))}

					<TouchableOpacity
						onPress={addTerm}
						className='flex-row items-center justify-center p-4 border border-dashed border-light-text/30 dark:border-dark-text/30 rounded-lg mb-6'>
						<Ionicons name='add-circle-outline' size={20} color={colors.text} />
						<Text className='text-light-text dark:text-dark-text ml-2'>
							Add Another Term
						</Text>
					</TouchableOpacity>
				</ScrollView>

				<TouchableOpacity
					onPress={handleSave}
					disabled={isLoading}
					className='bg-primary p-4 rounded-lg'>
					<Text className='text-center text-light-text dark:text-dark-text font-semibold text-lg'>
						{isLoading ? 'Saving...' : 'Save Terms & Conditions'}
					</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
};

export default TermsAndConditions;

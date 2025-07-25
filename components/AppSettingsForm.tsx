import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { appSettingsSchema, AppSettingsType } from '@/db/zodSchema';
import { useTheme } from '@/context/ThemeContext';
import { useAppSettings } from '@/context/AppSettingsContext';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import Picker from './Picker';
import BaseCard from './BaseCard';
import options from '@/utils/appSettingsOption';
import { getReorderedQuarters } from '@/utils/yearQuarters';

export default function AppSettingsForm({
	initialValues,
	onSubmit,
	onDelete,
	isSaved,
}: {
	initialValues?: Partial<AppSettingsType>;
	onSubmit: (values: AppSettingsType) => void;
	onDelete?: () => void;
	isSaved?: boolean;
}) {
	const { colors } = useTheme();
	const {
		control,
		setValue,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<AppSettingsType>({
		resolver: zodResolver(appSettingsSchema),
		defaultValues: initialValues,
	});

	const iconColor = colors.text;
	const [quarterOptions, setQuarterOptions] = useState(options.quarters);

	const { update } = useAppSettings();
	const handleFormSubmit = async (values: AppSettingsType) => {
		await update(values);
		onSubmit(values);
	};

	const handleQuarterChange = (val: string) => {
		setValue('quarterStartMonths', val);
		setQuarterOptions(getReorderedQuarters(val));
	};

	return (
		<ScrollView className='flex-1 p-4  bg-light-primary dark:bg-dark-primary'>
			<View className='gap-6'>
				<BaseCard>
					<View className='flex-row items-center gap-2 mb-1'>
						<FontAwesome5 name='calendar-alt' size={20} color={iconColor} />
						<Text className='text-lg font-bold text-light-text dark:text-dark-text'>Financial Year</Text>
					</View>
					<View className='flex-col gap-2'>
						<View className='flex-row gap-2 items-center'>
							<Text className='text-light-text dark:text-dark-text'>Start:</Text>
							<View style={{ flex: 1 }}>
								<Controller
									control={control}
									name='financialYearStartMonth'
									render={({ field }) => (
										<Picker
											items={options.months}
											onValueChange={(val) => field.onChange(Number(val))}
											initialValue={field.value ? String(field.value) : '1'}
										/>
									)}
								/>
							</View>
							<View style={{ flex: 1 }}>
								<Controller
									control={control}
									name='financialYearStartDay'
									render={({ field }) => (
										<Picker items={options.days} onValueChange={(val) => field.onChange(Number(val))} initialValue={field.value ? String(field.value) : '1'} />
									)}
								/>
							</View>
						</View>
						<View className='flex-row gap-2 items-center'>
							<Text className='text-light-text dark:text-dark-text'>End:</Text>
							<View style={{ flex: 1 }}>
								<Controller
									control={control}
									name='financialYearEndMonth'
									render={({ field }) => (
										<Picker
											items={options.months}
											onValueChange={(val) => field.onChange(Number(val))}
											initialValue={field.value ? String(field.value) : '12'}
										/>
									)}
								/>
							</View>
							<View style={{ flex: 1 }}>
								<Controller
									control={control}
									name='financialYearEndDay'
									render={({ field }) => (
										<Picker items={options.days} onValueChange={(val) => field.onChange(Number(val))} initialValue={field.value ? String(field.value) : '31'} />
									)}
								/>
							</View>
						</View>
					</View>
				</BaseCard>
				<BaseCard>
					<View className='flex-row items-center gap-2 mb-1'>
						<MaterialCommunityIcons name='calendar-range' size={20} color={iconColor} />
						<Text className='text-lg font-bold text-light-text dark:text-dark-text'>Quarters</Text>
					</View>
					<Controller
						control={control}
						name='quarterStartMonths'
						render={({ field }) => <Picker items={quarterOptions} onValueChange={handleQuarterChange} initialValue={field.value || quarterOptions[0].value} />}
					/>
					<Text className='text-xs text-light-text dark:text-dark-text mt-2'>
						The selected quarter will be treated as the first quarter of your financial year.
					</Text>
				</BaseCard>
				<BaseCard>
					<View className='flex-row items-center gap-2 mb-1'>
						<FontAwesome5 name='cogs' size={20} color={iconColor} />
						<Text className='text-lg font-bold text-light-text dark:text-dark-text'>General Settings</Text>
					</View>
					<View className='gap-2'>
						<Controller
							control={control}
							name='currency'
							render={({ field }) => <Picker items={options.currency} onValueChange={field.onChange} initialValue={field.value || options.currency[0].value} />}
						/>
						<Controller
							control={control}
							name='dateFormat'
							render={({ field }) => (
								<Picker items={options.dateFormat} onValueChange={field.onChange} initialValue={field.value || options.dateFormat[0].value} />
							)}
						/>
						<Controller
							control={control}
							name='numberFormat'
							render={({ field }) => (
								<Picker items={options.numberFormat} onValueChange={field.onChange} initialValue={field.value || options.numberFormat[0].value} />
							)}
						/>
						<Controller
							control={control}
							name='language'
							render={({ field }) => <Picker items={options.language} onValueChange={field.onChange} initialValue={field.value || options.language[0].value} />}
						/>
						<Controller
							control={control}
							name='theme'
							render={({ field }) => <Picker items={options.theme} onValueChange={field.onChange} initialValue={field.value || options.theme[0].value} />}
						/>
					</View>
				</BaseCard>
				<BaseCard>
					<View className='flex-row items-center gap-2 mb-1'>
						<FontAwesome5 name='sliders-h' size={20} color={iconColor} />
						<Text className='text-lg font-bold text-light-text dark:text-dark-text'>Invoice & Estimate Defaults</Text>
					</View>
					<View className='gap-2'>
						<Controller
							control={control}
							name='defaultPaymentTerms'
							render={({ field }) => (
								<TextInput
									className='border border-light-text dark:border-dark-text rounded px-3 py-2 text-light-text dark:text-dark-text'
									value={field.value?.toString() || ''}
									onChangeText={(text) => field.onChange(Number(text))}
									keyboardType='numeric'
									autoCapitalize='none'
									placeholderTextColor={colors.text}
									placeholder='Default Payment Terms (days)'
								/>
							)}
						/>
						<Controller
							control={control}
							name='defaultVatRate'
							render={({ field }) => (
								<TextInput
									className='border border-light-text dark:border-dark-text rounded px-3 py-2 text-light-text dark:text-dark-text'
									value={field.value?.toString() || ''}
									onChangeText={(text) => field.onChange(Number(text))}
									keyboardType='numeric'
									autoCapitalize='none'
									placeholderTextColor={colors.text}
									placeholder='Default VAT Rate (%)'
								/>
							)}
						/>
						<Controller
							control={control}
							name='invoicePrefix'
							render={({ field }) => (
								<TextInput
									className='border border-light-text dark:border-dark-text rounded px-3 py-2 text-light-text dark:text-dark-text'
									value={field.value || ''}
									onChangeText={field.onChange}
									autoCapitalize='characters'
									placeholderTextColor={colors.text}
									placeholder='Invoice Prefix'
								/>
							)}
						/>
						<Controller
							control={control}
							name='nextInvoiceNumber'
							render={({ field }) => (
								<TextInput
									className='border border-light-text dark:border-dark-text rounded px-3 py-2 text-light-text dark:text-dark-text'
									value={field.value?.toString() || ''}
									onChangeText={(text) => field.onChange(Number(text))}
									keyboardType='numeric'
									autoCapitalize='none'
									placeholderTextColor={colors.text}
									placeholder='Next Invoice Number'
								/>
							)}
						/>
						<Controller
							control={control}
							name='estimatePrefix'
							render={({ field }) => (
								<TextInput
									className='border border-light-text dark:border-dark-text rounded px-3 py-2 text-light-text dark:text-dark-text'
									value={field.value || ''}
									onChangeText={field.onChange}
									autoCapitalize='characters'
									placeholderTextColor={colors.text}
									placeholder='Estimate Prefix'
								/>
							)}
						/>
						<Controller
							control={control}
							name='nextEstimateNumber'
							render={({ field }) => (
								<TextInput
									className='border border-light-text dark:border-dark-text rounded px-3 py-2 text-light-text dark:text-dark-text'
									value={field.value?.toString() || ''}
									onChangeText={(text) => field.onChange(Number(text))}
									keyboardType='numeric'
									autoCapitalize='none'
									placeholderTextColor={colors.text}
									placeholder='Next Estimate Number'
								/>
							)}
						/>
						<Controller
							control={control}
							name='logoUrl'
							render={({ field }) => (
								<TextInput
									className='border border-light-text dark:border-dark-text rounded px-3 py-2 text-light-text dark:text-dark-text'
									value={field.value || ''}
									onChangeText={field.onChange}
									autoCapitalize='none'
									placeholderTextColor={colors.text}
									placeholder='Logo URL'
								/>
							)}
						/>
					</View>
				</BaseCard>
				<BaseCard>
					<View className='flex-row items-center gap-2 mb-1'>
						<FontAwesome5 name='bell' size={20} color={iconColor} />
						<Text className='text-lg font-bold text-light-text dark:text-dark-text'>Reminders & Tax</Text>
					</View>
					<View className='gap-2'>
						<Controller
							control={control}
							name='reminderEmailEnabled'
							render={({ field }) => (
								<TouchableOpacity
									className={`px-4 py-2 rounded ${field.value ? 'bg-light-accent dark:bg-dark-accent' : 'bg-light-nav dark:bg-dark-nav'}`}
									onPress={() => field.onChange(!field.value)}>
									<Text className='text-light-text dark:text-dark-text'>{field.value ? 'Email Reminders On' : 'Email Reminders Off'}</Text>
								</TouchableOpacity>
							)}
						/>
						<Controller
							control={control}
							name='reminderDaysBeforeDue'
							render={({ field }) => (
								<TextInput
									className='border border-light-text dark:border-dark-text rounded px-3 py-2 text-light-text dark:text-dark-text'
									value={field.value?.toString() || ''}
									onChangeText={(text) => field.onChange(Number(text))}
									keyboardType='numeric'
									autoCapitalize='none'
									placeholderTextColor={colors.text}
									placeholder='Days before due date'
								/>
							)}
						/>
						<Controller
							control={control}
							name='taxScheme'
							render={({ field }) => (
								<Picker items={options.taxScheme} onValueChange={field.onChange} initialValue={field.value || options.taxScheme[0].value} />
							)}
						/>
						<Controller
							control={control}
							name='defaultTaxCategory'
							render={({ field }) => (
								<Picker items={options.defaultTaxCategory} onValueChange={field.onChange} initialValue={field.value || options.defaultTaxCategory[0].value} />
							)}
						/>
					</View>
				</BaseCard>
				<BaseCard>
					<View className='flex-row items-center gap-2 mb-1'>
						<FontAwesome5 name='calendar-check' size={20} color={iconColor} />
						<Text className='text-lg font-bold text-light-text dark:text-dark-text'>Quarters & Automation</Text>
					</View>
					<View className='gap-2'>
						<Controller
							control={control}
							name='autoCalculateQuarters'
							render={({ field }) => (
								<TouchableOpacity
									className={`px-4 py-2 rounded ${field.value ? 'bg-light-accent dark:bg-dark-accent' : 'bg-light-nav dark:bg-dark-nav'}`}
									onPress={() => field.onChange(!field.value)}>
									<Text className='text-light-text dark:text-dark-text'>{field.value ? 'Auto Calculate Quarters On' : 'Auto Calculate Quarters Off'}</Text>
								</TouchableOpacity>
							)}
						/>
						<Controller
							control={control}
							name='quarterlyTaxEnabled'
							render={({ field }) => (
								<TouchableOpacity
									className={`px-4 py-2 rounded ${field.value ? 'bg-light-accent dark:bg-dark-accent' : 'bg-light-nav dark:bg-dark-nav'}`}
									onPress={() => field.onChange(!field.value)}>
									<Text className='text-light-text dark:text-dark-text'>{field.value ? 'Quarterly Tax Enabled' : 'Quarterly Tax Disabled'}</Text>
								</TouchableOpacity>
							)}
						/>
						<Controller
							control={control}
							name='quarterlyTaxReminderDays'
							render={({ field }) => (
								<TextInput
									className='border border-light-text dark:border-dark-text rounded px-3 py-2 text-light-text dark:text-dark-text'
									value={field.value?.toString() || ''}
									onChangeText={(text) => field.onChange(Number(text))}
									keyboardType='numeric'
									autoCapitalize='none'
									placeholderTextColor={colors.text}
									placeholder='Quarterly Tax Reminder Days'
								/>
							)}
						/>
					</View>
				</BaseCard>
				<View className='flex-row gap-3 mt-2'>
					<TouchableOpacity className='flex-1 bg-light-accent dark:bg-dark-accent py-3 rounded pb-4' onPress={handleSubmit(handleFormSubmit)}>
						<Text className='text-center text-light-text dark:text-dark-text font-bold'>{isSaved ? 'Update Settings' : 'Save Settings'}</Text>
					</TouchableOpacity>
					{isSaved && onDelete && (
						<TouchableOpacity className='flex-1 bg-danger dark:bg-danger py-3 rounded pb-4' onPress={onDelete}>
							<Text className='text-center text-dark-text font-bold'>Delete</Text>
						</TouchableOpacity>
					)}
				</View>
				<View className='h-10' />
			</View>
		</ScrollView>
	);
}

import React, { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

const ThemeToggle = () => {
	const { isDark, toggleTheme, setColorScheme } = useTheme();

	useEffect(() => {
		isDark ? setColorScheme('dark') : setColorScheme('light');
	}, [isDark]);

	return (
		<TouchableOpacity onPress={toggleTheme} className='p-2 rounded-full bg-light-primary dark:bg-dark-primary'>
			<MaterialCommunityIcons name={isDark ? 'weather-night' : 'weather-sunny'} size={24} className='text-light-text dark:text-dark-text' />
		</TouchableOpacity>
	);
};

export default ThemeToggle;

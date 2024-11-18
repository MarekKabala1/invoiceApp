import React from 'react';
import { View, Platform } from 'react-native';

interface BaseCardProps {
	children: React.ReactNode;
	className?: string;
}

const BaseCard: React.FC<BaseCardProps> = ({ children, className = '' }) => {
	return (
		<View
			className={`bg-navLight p-2 rounded-xl active:opacity-90 ${className}`}
			style={[
				Platform.OS === 'ios'
					? {
							shadowColor: '#000',
							shadowOffset: { width: 0, height: 4 },
							shadowOpacity: 0.25,
							shadowRadius: 10,
						}
					: { elevation: 10 },
			]}>
			{children}
		</View>
	);
};

export default BaseCard;

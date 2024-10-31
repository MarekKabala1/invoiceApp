import React from 'react';
import { View } from 'react-native';

interface BaseCardProps {
	children: React.ReactNode;
	className?: string;
}

const BaseCard: React.FC<BaseCardProps> = ({ children, className = '' }) => {
	return <View className={`bg-navLight p-2 rounded-lg shadow-sm  justify-between items-center ${className}`}>{children}</View>;
};

export default BaseCard;

import React from 'react';
import { View } from 'react-native';

interface BaseCardProps {
	children: React.ReactNode;
	className?: string;
}

const BaseCard: React.FC<BaseCardProps> = ({ children, className = '' }) => {
	return <View className={`bg-navLight p-3 rounded-xl shadow-lg active:opacity-90  ${className}`}>{children}</View>;
};

export default BaseCard;

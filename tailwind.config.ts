/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
	presets: [require('nativewind/preset')],
	theme: {
		extend: {
			colors: {
				primaryLight: '#D1DFDD',
				textLight: '#016D6D',
				secondaryLight: '#0B57A9',
				cardLight: '#F1E9E9',
				popoverBg: '#COAAAC',
				primaryDark: '#0F172A',
				secondaryDark: '#0B57A9',
				mutedForeground: '#64748B',
				accent: '#F1F5F9',
				danger: '#EF4444',
				border: '#E2E8F0',
				input: '#E2E8F0',
				success: '#39AD6A',
				textDark: '#E3DEDE',
				navLight: '#F1FCFA',
			},
		},
	},
	plugins: [],
};

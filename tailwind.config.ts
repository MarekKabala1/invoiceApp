/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
	presets: [require('nativewind/preset')],
	theme: {
		extend: {
			colors: {
				primaryLight: '#F3EDE2',
				textLight: '#8B5E3C',
				secondaryLight: '#0B57A9',
				cardLight: '#EADDC7',
				bg_accent: '#820000',
				popoverBg: '#CAAAC',
				primaryDark: '#0D3B66 ',
				secondaryDark: '#0B57A9',
				mutedForeground: '#64748B',
				accent: '#F1F5F9',
				danger: '#ee1c1c',
				border: '#E2E8F0',
				input: '#E2E8F0',
				success: '#39AD6A',
				textDark: '#E3DEDE',
				navLight: '#ede4d4',
			},
			backgroundImage: {
				'gradient': 'linear-gradient(to bottom, #c5ebe6, #d6e7d7, #e4e2d3, #e8ded8, #e3dede)',
				'gradient_2': 'linear-gradient(to bottom, #b5ede6, #b8ede6, #bbede6, #beece6, #c1ece6, #c6ede8, #cbeee9, #d0efeb, #d8f2ef, #e1f6f2, #e9f9f6, #f1fcfa)',
			},
		},
	},
	plugins: [],
};

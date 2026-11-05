/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        serif: ['PlusJakartaSans_600SemiBold'],
        'serif-bold': ['PlusJakartaSans_700Bold'],
        'serif-regular': ['PlusJakartaSans_400Regular'],
      },
    },
  },
  plugins: [],
};

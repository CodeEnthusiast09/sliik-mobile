/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Fraunces_600SemiBold'],
        'serif-bold': ['Fraunces_700Bold'],
        'serif-regular': ['Fraunces_400Regular'],
      },
    },
  },
  plugins: [],
};

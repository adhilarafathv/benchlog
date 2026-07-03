/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#0D0D0D',
        card: '#1A1A1A',
        cardElevated: '#222222',
        cardBorder: '#2A2A2A',
        accent: {
          DEFAULT: '#E53935',
          dark: '#C62828',
          light: '#FF5252',
        },
        push: '#E53935',
        legs: '#00BCD4',
        backBiceps: '#7C4DFF',
        upper: '#FF9800',
        textPrimary: '#FFFFFF',
        textSecondary: '#9E9E9E',
        textTertiary: '#616161',
      },
    },
  },
  plugins: [],
}

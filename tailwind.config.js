/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm, neutral background
        warmWhite: '#FAFAFA',
        // Soft, refined accent colors
        pastelBlue: '#E8F4F8',
        pastelGreen: '#E8F5E9',
        pastelOrange: '#FFF3E0',
        pastelPink: '#FCE4EC',
        // Refined text and border colors
        borderGray: '#E0E0E0',
        borderBlue: '#90A4AE',
        textPrimary: '#37474F',
        textSecondary: '#78909C',
        accentBlue: '#5C6BC0',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      fontFamily: {
        sans: [
          'ui-rounded',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0, 0, 0, 0.06)',
        'soft-md': '0 4px 6px rgba(0, 0, 0, 0.07)',
        'soft-lg': '0 10px 15px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 暖白色背景
        warmWhite: '#FAFAFA',
        // 粉嫩色系主題色
        pastelBlue: '#A8D8EA',
        pastelGreen: '#AAE3A8',
        pastelOrange: '#FFCBA4',
        pastelPink: '#FFB3BA',
        // 深灰/深藍線條色
        borderGray: '#4A5568',
        borderBlue: '#2C5F7C',
      },
      borderRadius: {
        'xl': '0.75rem',
      },
      borderWidth: {
        '2': '2px',
      },
      fontFamily: {
        // 圓潤無襯線字體
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
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'soft-md': '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}

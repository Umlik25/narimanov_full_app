/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        civic: {
          ink: '#172033',
          muted: '#657084',
          line: '#D9E0EA',
          surface: '#F6F8FB',
          blue: '#2563EB',
          purple: '#7C3AED',
          amber: '#D97706',
          orange: '#EA580C',
          green: '#16A34A',
          red: '#DC2626',
        },
      },
    },
  },
  plugins: [],
};

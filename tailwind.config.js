/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    backgroundSize: {
      '58%': '58%',
    },
    spacing: Array.from({ length: 1000 }).reduce((map, _, index) => {
      const value = ((index + 1) / 10).toFixed(1);
      const [integerPart, decimalPart] = value.split('.');
      const key = `${integerPart}-${decimalPart}`;
      const formattedValue = `${integerPart}.${decimalPart}`;
      map[key] = `${formattedValue}rem`;
      return map;
    }, {}),
    extend: {
      backgroundImage: {

      },
      colors: {
        "white100": "#EBF1F3",
        "red100": "#CE0E17",
        "red200": "#aa464b",
        "black100": "#191326"
      },
      fontSize: ({ theme }) => ({
        ...theme("spacing"),
      }),
      lineHeight: ({ theme }) => ({
        ...theme("spacing"),
      }),
    },
  },
  plugins: [],
};

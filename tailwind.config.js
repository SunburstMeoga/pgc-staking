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
        "gradientBubblegum": "linear-gradient(139.73deg, #E5FDFF 0%, #F3EFFF 100%)",
      },
      colors: {
        "white100": "#EBF1F3",
        "white200": "#F8F7F9",
        "white300": "#eeeaf4",
        "white400": "#D7CAEC",
        "white500": "#F6F6F6",
        "red100": "#CE0E17",
        "red200": "#aa464b",
        "red300": "#dc5c5c",
        "red400": "#370b08",
        "black100": "#191326",
        "gray100": "#e7e3eb"
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

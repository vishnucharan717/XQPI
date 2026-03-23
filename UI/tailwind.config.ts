import type { Config } from "tailwindcss";

const withMT = require("@material-tailwind/react/utils/withMT");

const config: Config = withMT({
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  
    // caretColor: ({ theme }) => theme('colors'),
    // colors: ({ colors }) => ({
    //   inherit: colors.inherit,
    //   current: colors.current,
    //   transparent: colors.transparent,
    //   black: colors.black,
    //   white: colors.white,
    //   slate: colors.slate,
    //   gray: colors.gray,
    //   zinc: colors.zinc,
    //   neutral: colors.neutral,
    //   stone: colors.stone,
    //   red: colors.red,
    //   orange: colors.orange,
    //   amber: colors.amber,
    //   yellow: colors.yellow,
    //   lime: colors.lime,
    //   green: colors.green,
    //   emerald: colors.emerald,
    //   teal: colors.teal,
    //   cyan: colors.cyan,
    //   sky: colors.sky,
    //   blue: colors.blue,
    //   indigo: colors.indigo,
    //   violet: colors.violet,
    //   purple: colors.purple,
    //   fuchsia: colors.fuchsia,
    //   pink: colors.pink,
    //   rose: colors.rose,
    //   theme_green: "#1e4d2b",
    //   theme_btn: "#105456"
    // }),
    extend: {
      colors: {
        theme_green: "#1e4d2b",
        theme_btn: "#105456",
        sky: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
});
export default config;

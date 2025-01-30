import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      spacing: { 
        "1.5vh": "1.5vh",
        "7vh": "7vh",
        "9vh": "9vh",
        "20vh": "20vh",
        "30vh": "30vh",
        "40vh": "40vh",
        "50vh": "50vh",
        "70vh":"70vh",
        "86vh": "86vh",
        "93vh": "93vh",
        "100vh": "100vh",
        "10vw": "10vw",
        "25vw": "25vw",
        "50vw": "50vw",
        "65vw": "65vw",
        "70vw": "70vw",
        "90vw": "90vw",
        "100vw": "100vw",
      },
    },
  },
  plugins: [],
};
export default config;

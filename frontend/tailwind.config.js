/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: "#f2f7ea",
          100: "#e2edd2",
          500: "#5f8f47",
          700: "#3d6732"
        },
        clay: {
          100: "#f4ded1",
          500: "#c87951"
        },
        sun: {
          100: "#fff1bc",
          500: "#e4a72c"
        },
        water: {
          100: "#ddedf2",
          500: "#4c8fa3"
        }
      },
      boxShadow: {
        soft: "0 10px 24px rgba(72, 88, 67, 0.08)"
      }
    }
  },
  plugins: []
};

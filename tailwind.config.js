module.exports = {
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./styles/**/*.{js,jsx,ts,tsx,css}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sftregular: ["SFT-regular"],
        sftmedium: ["SFT-medium"],
        sftbold: ["SFT-bold"],
        sftlight: ["SFT-light"],
        sftextralight: ["SFT-extralight"],
        sftextrabold: ["SFT-extrabold"],
        sftdemibold: ["SFT-demibold"],
        sftblack: ["SFT-black"],
      },
      colors: {
        primary: "rgba(246, 245, 240, 1)", // Light cream/off-white
        secondary: "rgba(230, 230, 230, 1)", // Light gray
        "text-primary": "rgba(0, 0, 0, 1)", // Pure black
      },
    },
  },
  plugins: [],
};

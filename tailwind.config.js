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
    },
  },
  plugins: [],
};

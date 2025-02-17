module.exports = {
  content: [
    './renderer/pages/**/*.{js,ts,jsx,tsx}',
    './renderer/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        lightbg: "#DEF3FF",
        primary: {
          '50': '#f9f7fd',
          '100': '#f2ecfb',
          '200': '#e6dcf8',
          '300': '#d3c1f1',
          '400': '#b899e7',
          '500': '#9d71db',
          '600': '#8553ca',
          '700': '#7140b0',
          '800': '#603990',
          '900': '#4c2d70',
          '950': '#331754',
        },
        secondry: {
          '50': '#f0fdfa',
          '100': '#c4fcef',
          '200': '#96f9e4',
          '300': '#5aeed4',
          '400': '#28d9c0',
          '500': '#0fbda7',
          '600': '#099888',
          '700': '#0c796e',
          '800': '#0f6059',
          '900': '#11504a',
          '950': '#03302e',
        },
      },
    },
  },
  plugins: [],
}

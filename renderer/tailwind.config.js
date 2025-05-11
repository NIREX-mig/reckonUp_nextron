module.exports = {
  content: ['./renderer/pages/**/*.{js,ts,jsx,tsx}', './renderer/components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lightbg: '#DEF3FF',
        btn: '#3e514c',
        primary: {
          50: '#F0FDF5',
          100: '#DCFCE8',
          200: '#BCF6D2',
          300: '#87EEB0',
          400: '#45DB82',
          500: '#24C365',
          600: '#18A150',
          700: '#167F41',
          800: '#176437',
          900: '#155230',
          950: '#052E18',
        },
        secondry: {
          50: '#f0fdfa',
          100: '#c4fcef',
          200: '#96f9e4',
          300: '#5aeed4',
          400: '#28d9c0',
          500: '#0fbda7',
          600: '#099888',
          700: '#0c796e',
          800: '#0f6059',
          900: '#11504a',
          950: '#03302e',
        },
      },
    },
  },
  plugins: [],
};

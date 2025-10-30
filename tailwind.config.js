/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.jade",
    "./routes/**/*.js",
    "./app.js"
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#6a11cb',
        'brand-secondary': '#2575fc'
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        'elegant': '0 10px 25px rgba(0, 0, 0, 0.1)'
      }
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        corporate: {
          "primary": "#6a11cb",
          "secondary": "#2575fc",
          "accent": "#37cdbe",
          "neutral": "#3d4451",
          "base-100": "#ffffff",
        },
      },
      "dark", 
      "cupcake"
    ],
  },
};

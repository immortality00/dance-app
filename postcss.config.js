module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-preset-env': {
      features: {
        'nesting-rules': true,
      },
      browsers: [
        'defaults',
        'not IE 11',
        'not IE_Mob 11',
        'maintained node versions',
      ],
    },
  },
} 
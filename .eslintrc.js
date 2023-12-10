module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  'extends': [
    'plugin:vue/vue3-essential', // Используйте 'plugin:vue/essential' для Vue 2
    'eslint:recommended',
  ],
  parserOptions: {
    parser: 'babel-eslint', // 'babel-eslint' для старых проектов, для новых используйте '@babel/eslint-parser'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // Добавьте сюда свои правила
    'vue/multi-word-component-names': 'off',
    'vue/no-deprecated-slot-attribute': 'off',
    'vue/no-deprecated-dollar-scopedslots-api': 'off',
    'vue/no-deprecated-slot-scope-attribute': 'off',
  },
};
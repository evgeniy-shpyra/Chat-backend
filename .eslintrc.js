module.exports = {
    env: {
        node: true,
        commonjs: true,
        es2021: true,
    },
    overrides: [],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
    },
    plugins: ['@typescript-eslint', 'sonarjs', 'prettier'],
    rules: {},
}

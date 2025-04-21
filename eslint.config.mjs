import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config({
	extends: [eslint.configs.recommended, tseslint.configs.recommendedTypeChecked, tseslint.configs.stylisticTypeChecked],
	plugins: {
		'@typescript-eslint': tseslint.plugin,
	},
	languageOptions: {
		parser: tseslint.parser,
		parserOptions: {
			ecmaVersion: 'latest',
			jsDocParsingMode: 'type-info',
			lib: ['esnext'],
			projectService: {
				allowDefaultProject: ['eslint.config.mjs'],
				defaultProject: 'tsconfig.json',
			},
			tsconfigRootDir: import.meta.dirname,
		},
	},
	rules: {
		'no-async-promise-executor': 'off',
		'@typescript-eslint/consistent-type-imports': 'error',
		'@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
		'@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true, ignoreVoidOperator: true }],
		'@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: true }],
		'@typescript-eslint/no-floating-promises': ['error', { checkThenables: true, ignoreIIFE: true }],
		'@typescript-eslint/no-namespace': 'off',
	},
});

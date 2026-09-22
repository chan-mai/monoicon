import pluginMisskey from '@misskey-dev/eslint-plugin';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';

export default [
	{
		ignores: ['**/dist/**', '**/.nuxt/**', '**/.output/**', '**/node_modules/**', '**/generated/**', '**/.wrangler/**'],
	},
	...pluginMisskey.configs['recommended'],
	{
		files: ['**/*.js', '**/*.mjs'],
		languageOptions: {
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
		},
	},
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parserOptions: {
				ecmaVersion: 'latest',
				parser: tseslint.parser,
				projectService: true,
				sourceType: 'module',
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		files: ['server/**/*.ts'],
		languageOptions: { globals: globals.node },
	},
	{
		files: ['app/**/*.{ts,vue}'],
		languageOptions: { globals: globals.browser },
	},
	{
		files: ['**/*.vue'],
		plugins: {
			vue: pluginVue,
			...pluginMisskey.configs.javascript.plugins,
		},
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				parser: tseslint.parser,
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
			globals: globals.browser,
		},
		rules: {
			...pluginVue.configs['flat/recommended'].rules,
			...pluginMisskey.configs.javascript.rules,
			// Nuxt auto-import用
			'no-undef': 'off',
		},
	},
	{
		files: [
			'eslint.config.mjs',
			'nuxt.config.ts',
			'app/pages/**',
			'app/layouts/**',
			'server/api/**',
			'server/routes/**',
			'server/plugins/**',
		],
		rules: {
			'import/no-default-export': 'off',
		},
	},
];

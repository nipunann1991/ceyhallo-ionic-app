import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';

export default tseslint.config(
    {
        files: ['**/*.ts', '**/*.tsx'],
        extends: [
            eslint.configs.recommended,
            ...tseslint.configs.recommended,
            ...angular.configs.tsRecommended,
        ],
        processor: angular.processInlineTemplates,
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@angular-eslint/prefer-inject': 'off',
            '@angular-eslint/no-empty-lifecycle-method': 'off',
            'no-async-promise-executor': 'off',
            'no-empty': 'off',
            'prefer-const': 'off'
        }
    },
    {
        files: ['**/*.html'],
        extends: [
            ...angular.configs.templateRecommended,
            ...angular.configs.templateAccessibility,
        ],
        rules: {
            '@angular-eslint/template/click-events-have-key-events': 'off',
            '@angular-eslint/template/interactive-supports-focus': 'off',
            '@angular-eslint/template/elements-content': 'off',
            '@angular-eslint/template/label-has-associated-control': 'off',
            '@angular-eslint/template/role-has-required-aria-props': 'off',
            '@angular-eslint/template/alt-text': 'off',
            '@angular-eslint/template/prefer-control-flow': 'off'
        }
    }
);

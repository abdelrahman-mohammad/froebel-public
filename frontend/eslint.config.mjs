import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    prettier,
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        ".next/**",
        "out/**",
        "build/**",
        "next-env.d.ts",
    ]),
    // Downgrade React Compiler errors to warnings for existing code patterns
    {
        files: ["**/*.tsx", "**/*.ts"],
        rules: {
            "react-hooks/use-memo": "warn",
            "react-hooks/preserve-manual-memoization": "warn",
        },
    },
]);

export default eslintConfig;

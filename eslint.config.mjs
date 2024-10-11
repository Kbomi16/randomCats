import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import tailwindcss from "eslint-plugin-tailwindcss";

export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,

  {
    plugins: { prettier: prettierPlugin },
    rules: { "prettier/prettier": "error" }
  },
  prettier, 
  
  {
    plugins: { tailwindcss },
    extends: ["plugin:tailwindcss/recommended"]
  }
];

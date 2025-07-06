module.exports = {
  // Core formatting
  printWidth: 80, // wrap at 80 characters
  tabWidth: 2, // 2 spaces per indent level
  useTabs: false, // no tabs — spaces only
  semi: true, // always end statements with semicolons
  singleQuote: true, // use single quotes instead of double
  quoteProps: "as-needed", // only quote object properties when required
  jsxSingleQuote: false, // JSX uses double quotes
  trailingComma: "all", // include trailing commas wherever possible
  bracketSpacing: true, // { foo: bar }
  bracketSameLine: false, // put > of JSX tags on their own line
  arrowParens: "always", // include parens around arrow fn params
  endOfLine: "lf", // enforce Unix line endings
  proseWrap: "preserve", // respect markdown text wrapping
  // Plugins for import sorting & Tailwind support
  plugins: [
    "@ianvs/prettier-plugin-sort-imports", // auto‑sort and group your imports
    "prettier-plugin-tailwindcss", // class-ordering for Tailwind CSS (must be last)
  ],
  // Configuration for @ianvs/prettier-plugin-sort-imports
  importOrder: [
    // 1) React core
    "^react$",
    // 2) Next.js (and next/*)
    "^next(/.*|$)",
    // 3) External packages
    "^@?\\w",
    // 4) Absolute imports (from tsconfig paths)
    "^[^.]",
    // 5) Relative imports
    "^\\./",
    // 6) Styles (CSS, SCSS, etc.)
    "^.+\\.(css|scss)$"
  ],
};

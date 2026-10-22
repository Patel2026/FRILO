import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
  // Next 16.4 enables additional React Compiler diagnostics. Keep the existing
  // effect patterns visible during this security upgrade; new files retain errors.
  // Tracking: docs/security-review-2026-10-22.md (frontend lint baseline).
  {
    files: [
      "app/commande/page.tsx",
      "app/commande/paiement/retour/page.tsx",
      "app/contact/page.tsx",
      "app/dashboard/caisse/page.tsx",
      "app/dashboard/contacts/page.tsx",
      "app/dashboard/echeances/page.tsx",
      "app/dashboard/orders/[[]id]/page.tsx",
      "app/secteurs/[[]slug]/page.tsx",
      "app/templates/[[]id]/page.tsx",
      "app/templates/compare/page.tsx",
      "app/templates/page.tsx",
      "components/dashboard/NotificationsBell.tsx",
    ],
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    files: ["app/commande/paiement/retour/page.tsx"],
    rules: {
      "react-hooks/static-components": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "test-api.js",
  ]),
]);

export default eslintConfig;

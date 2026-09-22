import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

/**
 * R006 (phase 9.18) — le dépôt n'avait aucun lanceur de tests : la seule
 * barrière avant le déploiement Vercel était `prebuild` (lint + tsc), qui ne
 * voit ni un jeton oublié dans un en-tête, ni un `process.env` lu depuis le
 * navigateur — la panne du formulaire de service (D-13) est justement passée
 * par là.
 *
 * `environment: 'jsdom'` ne concerne que les composants ; les tests des server
 * actions n'ont besoin que de `fetch`, simulé par cas.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['{components,lib,utils}/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
});

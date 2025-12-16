import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuração essencial para deploy no GitHub Pages
export default defineConfig({
  plugins: [react()],
  // 'base' define o caminho base para './' permitindo que o app rode em subdiretórios
  // Isso corrige o erro de tela branca/404 no GitHub Pages
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});
import { defineConfig } from 'vite';
import {resolve} from "node:path";

export default defineConfig({
  server: {
    fs: {
      allow: ['..'] // allow parent directories
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  build: {
    outDir: "dist",
    cssCodeSplit: false,
    emptyOutDir: true,
    lib: {
      entry: "src/mount.ts",
      name: "multiwidget",
      formats: ["iife"],
      fileName: () => "reactedge-loader.js",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        assetFileNames: `widget-loader.[ext]`,
      },
    },
    minify: true,
    sourcemap: false
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      "@reactedge": resolve(
          __dirname,
          "../../../packages/widget-build/shared-resources"
      ),
    },
  }
});
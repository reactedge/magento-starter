import { defineConfig } from 'vite';
import {resolve} from "node:path";

export default defineConfig(({ mode }) => ({
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
        assetFileNames: `widget-loader.[ext]`,
      },
    },
    minify: mode === 'production',
    sourcemap: mode !== 'production',
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      "@reactedge": resolve(
          import.meta.dirname,
          "../../../packages/widget-build/shared-resources"
      ),
    },
  }
})
);
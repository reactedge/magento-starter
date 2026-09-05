import { defineConfig} from "vite";
import type { BuildOptions } from "vite"
import react from "@vitejs/plugin-react-swc";
import pkg from './package.json';
import {dirname, resolve} from "node:path";
import {createNpmBuildDefaults} from "../../packages/widget-build/shared-resources/widget-preset/createReactEdgeConfig";
import {fileURLToPath} from "node:url";
import { npmManifestPlugin} from "../../packages/widget-build/shared-resources/widget-preset/npmManifestPlugin";

const widgetName = pkg.name.replace(/^widget-/, "");
const widgetDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@reactedge": resolve(
          widgetDir,
          "../../packages/widget-build/shared-resources"
      ),
    },
  },
  publicDir: resolve(__dirname, "public"),
  plugins: [
      react(),
      npmManifestPlugin({
        widgetName,
        version: pkg.version,
        css: true,
      }),
  ],
  define: {
    __REACTEDGE_MODE__: JSON.stringify(
        process.env.REACTEDGE_MODE ?? "render"
    ),
  },
  build: createNpmBuildDefaults<BuildOptions>({
    widgetName,
    entry: resolve(widgetDir, "api/index.ts"),
    outDir: resolve(
        widgetDir,
        `../../workspace/release/source/${widgetName}`
    ),
    emitCss: true
  }),
});
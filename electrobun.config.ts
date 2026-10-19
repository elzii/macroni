import type { ElectrobunConfig } from "electrobun";

export default {
  app: {
    name: "macron",
    identifier: "com.owenmelbourne.macron",
    version: "1.0.0",
  },
  build: {
    bun: {
      entrypoint: "src/bun/index.ts",
      external: [],
    },
    views: {
      mainview: {
        entrypoint: "src/mainview/index.tsx",
        external: [],
      },
    },
    copy: {
      "src/mainview/index.html": "views/mainview/index.html",
      "src/mainview/index.css": "views/mainview/index.css",
    },
    mac: {
      bundleCEF: false,
      icons: "assets/appIcon.iconset",
    },
    linux: {
      bundleCEF: false,
    },
    win: {
      bundleCEF: false,
    },
  },
} satisfies ElectrobunConfig;

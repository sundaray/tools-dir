// packages/frontend/src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // Add any other VITE_ prefixed env variables you use
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// CSS module declarations
declare module "*.css?url" {
  const url: string;
  export default url;
}

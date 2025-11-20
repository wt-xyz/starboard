/// <reference types="vite/client" />
/// <reference types="redux-persist" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_POSITION_MOCKS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

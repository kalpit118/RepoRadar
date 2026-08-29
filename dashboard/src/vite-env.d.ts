/// <reference types="vite/client" />

// Allows TypeScript to import CSS modules
declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

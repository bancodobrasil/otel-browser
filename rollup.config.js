import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonJS from "@rollup/plugin-commonjs";
import external from "rollup-plugin-peer-deps-external";
import { terser } from "rollup-plugin-terser"
import dts from "rollup-plugin-dts";
import pkg from "./package.json";


const config = [
  // CommonJS build.
  {
    input: "src/index.ts",
    output: [
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" },
    ],
    plugins: [
      typescript({ tsconfig: "./tsconfig.json" }),
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      "@opentelemetry/exporter-trace-otlp-http/build/esnext"
    ],
  },
  // type definitions
  {
    input: 'dist/esm/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts()],
  }

]

export default config;
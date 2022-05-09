import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import pkg from "./package.json";

export default [
  // browser-friendly UMD build
  {
    input:"src/index.ts",
    output: {
      name: "otelBrowser",
      file: pkg.browser,
      format: "umd",
      globals: {
        "@opentelemetry/api":"api",
        "@opentelemetry/sdk-trace-base":"sdkTraceBase",
        "@opentelemetry/exporter-trace-otlp-http":"exporterTraceOtlpHttp",
        "@opentelemetry/sdk-trace-web":"sdkTraceWeb",
        "@opentelemetry/instrumentation-fetch":"instrumentationFetch",
        "@opentelemetry/context-zone":"contextZone",
        "@opentelemetry/propagator-b3":"propagatorB3",
        "@opentelemetry/instrumentation":"instrumentation",
        "@opentelemetry/resources":"resources",
        "@opentelemetry/semantic-conventions":"semanticConventions",
        "@opentelemetry/instrumentation-document-load":"instrumentationDocumentLoad"
      }
    },
    plugins: [
      // globals(),
      // builtins(),
      nodeResolve({jsnext: true, module: true}),
      commonjs({
        include: 'node_modules/**'
      }),
      json(),
      typescript({ tsconfig: "./tsconfig.json" })
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
  },
  // CommonJS (for Node) and ES module (for bundlers) build.
  {
    input: "src/index.ts",
    output: [
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" },
    ],
    plugins: [
      typescript({ tsconfig: "./tsconfig.json" })
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
  }
]
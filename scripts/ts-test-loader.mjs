// Minimal ESM loader that transpiles TypeScript on the fly using the project's
// already-installed `typescript` compiler. This lets `node --test` run the
// repo's `*.test.ts` suites on Node versions WITHOUT native type stripping
// (e.g. the Node 20 used by CI, where `--experimental-strip-types` does not
// exist). On newer Node it stays correct — it just transpiles instead of
// relying on the built-in stripper. No extra runtime dependency is added.
//
// Usage: node --loader ./scripts/ts-test-loader.mjs --test <files>
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export async function load(url, context, nextLoad) {
  if (url.endsWith(".ts")) {
    const fileName = fileURLToPath(url);
    const { outputText } = ts.transpileModule(readFileSync(fileName, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
      fileName,
    });
    return { format: "module", source: outputText, shortCircuit: true };
  }
  return nextLoad(url, context);
}

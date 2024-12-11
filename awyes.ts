import pkg from "./package.json";
import * as ts from "typescript";
import * as path from "path";
import { Flow } from "./types";
import { Command } from "commander";
import { registerHeadless } from "./headless";
import { createServer, registerCallers, registerReceivers } from "./remote";

export { Graph } from "./types";

export async function register(flows: Flow<any>[]) {
  // const program = new Command();
  // program
  //   .name("awyes")
  //   .description("CLI tool for running flows")
  //   .option("--headless", "Run the CLI in headless mode")
  //   .parse();
  // if (program.opts().headless) {
  //   flows.forEach(registerHeadless(program));
  // } else {
  //   await createServer()
  //     .then((server) => {
  //       flows.forEach(registerReceivers(server));
  //     })
  //     .catch(() => {}) // Ignore errors, this more than likely means the server is already running
  //     .finally(() => {
  //       flows.forEach(registerCallers(program));
  //     });
  // }
  // program.parse();

  function getImportedFunctionSignatures(entryFile: string) {
    const program = ts.createProgram([entryFile], {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.CommonJS,
      noResolve: false,
      skipLibCheck: true,
    });
    const checker = program.getTypeChecker();
    const sourceFile = program.getSourceFile(entryFile);

    (function importsAndExportsFrom(sourceFile: ts.SourceFile) {
      ts.forEachChild(sourceFile, (node) => {
        switch (node.kind) {
          case ts.SyntaxKind.ExportDeclaration:
          case ts.SyntaxKind.ImportDeclaration: {
            const decl = node as ts.ImportDeclaration | ts.ExportDeclaration;
            const module = decl.moduleSpecifier;
            const symbol = checker.getSymbolAtLocation(module);
            if (!module || !symbol || module.getText().includes(pkg.name)) {
              return;
            }
            importsAndExportsFrom(symbol.declarations.pop() as ts.SourceFile);
            break;
          }
          case ts.SyntaxKind.FunctionDeclaration: {
            const func = node as ts.FunctionDeclaration;
            const name = func.name.getText();
            const signature = checker.getSignatureFromDeclaration(func);
            const returnType = checker.typeToString(
              checker.getReturnTypeOfSignature(signature),
              undefined,
              ts.TypeFormatFlags.NoTruncation
            );
            const parameters = Object.fromEntries(
              func.parameters.map((p) => [p.name.getText(), p.type.getText()])
            );

            console.log(name, parameters, returnType);
          }
          default:
            break;
        }
      });
    })(sourceFile);
  }

  // Example usage (will work with any awyes.ts location)
  const signatures = getImportedFunctionSignatures(
    path.join(process.cwd(), "./awyes.ts")
  );
  // signatures.forEach(({ file, line, signature }) => {
  //   console.log(`${file}:${line} - ${signature}`);
  // });
}

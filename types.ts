import pkg from "./package.json";
import * as ts from "typescript";

export default function types(entryFile: string): {
  name: string;
  parameters: Record<string, string>;
  returnType: string;
}[] {
  const results: ReturnType<typeof types> = [];
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

          results.push({ name, parameters, returnType });
          break;
        }
        default:
          break;
      }
    });
  })(sourceFile);

  return results;
}

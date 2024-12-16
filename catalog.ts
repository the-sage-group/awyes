import pkg from "./package.json";
import * as path from "path";
import * as ts from "typescript";
import { Catalog } from "./types";

export default function compile(entryFile: string, actions: object): Catalog {
  const catalog: Catalog = {};

  const program = ts.createProgram([entryFile], {
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.CommonJS,
    noResolve: false,
    skipLibCheck: true,
  });
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(entryFile);

  (function follow(src: ts.SourceFile, dir: string = "") {
    ts.forEachChild(src, (node) => {
      switch (node.kind) {
        case ts.SyntaxKind.ExportDeclaration:
        case ts.SyntaxKind.ImportDeclaration: {
          const decl = node as ts.ImportDeclaration | ts.ExportDeclaration;
          const module = decl.moduleSpecifier;
          const symbol = checker.getSymbolAtLocation(module);
          if (!module || !symbol) {
            return;
          }
          const moduleName = module.getText().slice(1, -1);
          if (moduleName.includes(pkg.name)) {
            return;
          }
          follow(
            symbol.declarations.pop() as ts.SourceFile,
            path.join(dir, moduleName)
          );
          break;
        }
        case ts.SyntaxKind.FunctionDeclaration: {
          const func = node as ts.FunctionDeclaration;
          const name = func.name.getText();
          const id = path.join(dir, name);
          const action = id.split(path.sep).reduce((module, path) => {
            return module[path] || module;
          }, actions);
          if (typeof action !== "function") {
            return;
          }
          const signature = checker.getSignatureFromDeclaration(func);
          const deps = func.parameters.map((p) => {
            const typeNode = p.type as ts.TypeReferenceNode;
            const depNode = typeNode.typeArguments?.[0] as ts.TypeQueryNode;
            if (!depNode) {
              return;
            }
            const depType = checker.getTypeFromTypeNode(depNode);
            const dep = depType.symbol.declarations.pop();
            const depId = path.relative(dir, dep.getSourceFile().fileName);
            console.log(depId);
            return [];
          });
          const parameters = func.parameters.map((p) => ({
            name: p.name.getText(),
            type: p.type.getText(),
          }));
          const returnType = checker.typeToString(
            checker.getReturnTypeOfSignature(signature),
            undefined,
            ts.TypeFormatFlags.NoTruncation
          );
          catalog[id] = {
            id,
            action,
            parameters,
            returnType,
            deps: deps.flat(),
          };
          break;
        }
        default:
          break;
      }
    });
  })(sourceFile);

  return catalog;
}

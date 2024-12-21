import pkg from "./package.json";
import * as ts from "typescript";
import * as path from "path";
import { Node } from "./types";

export default class Catalog {
  entries: { [id: string]: Node };
  module: object;
  program: ts.Program;
  checker: ts.TypeChecker;
  sourceFile: ts.SourceFile;

  constructor(path: string, module: object) {
    this.module = module;
    this.entries = {};
    this.program = ts.createProgram([path], {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.CommonJS,
      noResolve: false,
      skipLibCheck: true,
    });
    this.checker = this.program.getTypeChecker();
    this.sourceFile = this.program.getSourceFile(path);
  }

  findInModule(fileName: string, funcName: string) {
    const module = fileName.split(path.sep).reduce((module, path) => {
      return module[path] || module;
    }, this.module);
    return typeof module[funcName] === "function" ? module[funcName] : null;
  }

  scan(sourceFile: ts.SourceFile = this.sourceFile) {
    ts.forEachChild(sourceFile, (node) => {
      switch (node.kind) {
        case ts.SyntaxKind.ExportDeclaration:
        case ts.SyntaxKind.ImportDeclaration: {
          const decl = node as ts.ImportDeclaration | ts.ExportDeclaration;
          const spec = decl.moduleSpecifier;
          const self = spec?.getText().includes(pkg.name);
          const symbol = this.checker.getSymbolAtLocation(spec);
          if (self || !spec || !symbol || !symbol.declarations.length) {
            return;
          }
          this.scan(symbol.declarations.pop() as ts.SourceFile);
          break;
        }
        case ts.SyntaxKind.FunctionDeclaration: {
          const func = node as ts.FunctionDeclaration;
          const name = func.name.getText();
          const action = this.findInModule(sourceFile.fileName, name);
          if (typeof action !== "function") {
            return;
          }
          const signature = this.checker.getSignatureFromDeclaration(func);
          const deps = func.parameters.map((p) => {
            const typeNode = p.type as ts.TypeReferenceNode;
            const depNode = typeNode.typeArguments?.[0] as ts.TypeQueryNode;
            if (!depNode) {
              return;
            }
            const depSymbol = this.checker.getTypeFromTypeNode(depNode).symbol;
            const depFunc = depSymbol.declarations[0] as ts.FunctionDeclaration;
            const depAction = this.findInModule(
              depFunc.getSourceFile().fileName,
              depFunc.name.getText()
            );
            return depAction;
          });
          const parameters = func.parameters.map((p) => ({
            name: p.name.getText(),
            type: p.type.getText(),
          }));
          const returnType = this.checker.typeToString(
            this.checker.getReturnTypeOfSignature(signature),
            undefined,
            ts.TypeFormatFlags.NoTruncation
          );
          this.entries[name] = {
            id: name,
            action: console.log,
            parameters,
            returnType,
            deps: [],
          };
        }
      }
    });
    return this;
  }
}

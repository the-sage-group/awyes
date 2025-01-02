import ts from "typescript";
import pkg from "./package.json";
import { v4 as uuid } from "uuid";
import { relative, parse, sep } from "path";
import { Node } from "./types";

export default class Catalog {
  cwd: string;
  src: ts.SourceFile;
  nodes: Node[];
  module: object;
  program: ts.Program;
  checker: ts.TypeChecker;

  constructor(path: string, module: object) {
    this.nodes = [];
    this.module = module;
    this.program = ts.createProgram([path], {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.CommonJS,
    });
    this.checker = this.program.getTypeChecker();
    this.src = this.program.getSourceFile(path);
    this.cwd = parse(process.cwd()).dir;

    this.scan(this.src);
  }

  findInModule(fileName: string, funcName: string) {
    const module = fileName.split(sep).reduce((module, path) => {
      return module[path] || module;
    }, this.module);
    return typeof module[funcName] === "function" ? module[funcName] : null;
  }

  scan(src: ts.SourceFile) {
    ts.forEachChild(src, (node) => {
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
          const type = `${parse(relative(this.cwd, src.fileName)).dir}/${name}`;
          const action = this.findInModule(src.fileName, name);
          if (typeof action !== "function" || func.parameters.length > 1) {
            return;
          }
          const description = ts
            .getJSDocCommentsAndTags(func)
            .reduce((acc, tag) => acc + tag.comment, "");
          const signature = this.checker.getSignatureFromDeclaration(func);
          // Parameters
          const paramType = this.checker.getTypeAtLocation(func.parameters[0]);
          const paramProps = this.checker.getPropertiesOfType(paramType);
          const parameters = paramProps.map((property) => ({
            name: property.getName(),
            type: this.checker.typeToString(
              this.checker.getTypeOfSymbol(property),
              undefined,
              ts.TypeFormatFlags.NoTruncation
            ),
            value: null,
          }));
          // Returns
          const returnType = this.checker.getReturnTypeOfSignature(signature);
          const awaitedType = this.checker.getAwaitedType(returnType);
          const returnProps = this.checker.getPropertiesOfType(awaitedType);
          const returns = returnProps.map((property) => ({
            name: property.getName(),
            type: this.checker.typeToString(
              this.checker.getTypeOfSymbol(property),
              undefined,
              ts.TypeFormatFlags.NoTruncation
            ),
            value: null,
          }));
          this.nodes.push({
            id: uuid(),
            name,
            type,
            action,
            parameters,
            returns,
            description,
          });
        }
      }
    });
    return this;
  }
}

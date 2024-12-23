import pkg from "./package.json";
import * as ts from "typescript";
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
          const id = `${parse(relative(this.cwd, src.fileName)).dir}/${name}`;
          const action = this.findInModule(src.fileName, name);
          if (typeof action !== "function") {
            return;
          }
          const signature = this.checker.getSignatureFromDeclaration(func);
          const parameters = func.parameters.map((p) => ({
            name: p.name.getText(),
            type: p.type.getText(),
          }));
          const returnType = this.checker.typeToString(
            this.checker.getReturnTypeOfSignature(signature),
            undefined,
            ts.TypeFormatFlags.NoTruncation
          );
          const description = ts
            .getJSDocCommentsAndTags(func)
            .reduce((acc, tag) => acc + tag.comment, "");
          this.nodes.push({
            id,
            name,
            action,
            parameters,
            returnType,
            description,
          });
        }
      }
    });
    return this;
  }
}

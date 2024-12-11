import pkg from "./package.json";
import * as ts from "typescript";

type Catalog = {
  [name: string]: {
    id: string;
    action: (...args: any[]) => any;
    metadata: {
      parameters: Record<string, string>;
      returnType: string;
    };
  };
};

export default function compile(entryFile: string, recipes: object[]): Catalog {
  const catalog: Catalog = {};
  // Grab all the functions, insert their id and action into the catalog, keyed by name
  for (const recipe of recipes) {
    (function extractSteps(recipe: object, workingTitle: string = "") {
      Object.getOwnPropertyNames(recipe).forEach((step) => {
        const subRecipe = recipe[step];
        const id = workingTitle ? `${workingTitle}.${step}` : step;
        switch (typeof subRecipe) {
          case "function":
            const action = subRecipe as Function;
            catalog[action.name] = { id, action } as Catalog[string];
            break;
          case "object":
            extractSteps(subRecipe, id);
            break;
        }
      });
    })(recipe);
  }

  // Fill in the metadata for each function
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
          const parameters = Object.fromEntries(
            func.parameters.map((p) => [p.name.getText(), p.type.getText()])
          );
          const returnType = checker.typeToString(
            checker.getReturnTypeOfSignature(signature),
            undefined,
            ts.TypeFormatFlags.NoTruncation
          );
          catalog[name] = {
            ...catalog[name],
            metadata: { parameters, returnType },
          };
          break;
        }
        default:
          break;
      }
    });
  })(sourceFile);

  // Remove any functions that don't have metadata, or don't have an action
  Object.keys(catalog).forEach((name) => {
    if (!catalog[name].metadata || !catalog[name].action) {
      delete catalog[name];
    }
  });

  return catalog;
}

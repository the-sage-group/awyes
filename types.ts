type Edge = { source: string; target: string };
type Node = (...args: any[]) => any & { name: string };

export class Graph {
  context: object;
  nodes: Node[][];

  constructor(context = {}, nodes: Node[][] = []) {
    this.context = context;
    this.nodes = nodes;
  }

  get edges(): Edge[] {
    const edges: Edge[] = [];
    for (let i = 0; i < this.nodes.length - 1; i++) {
      for (const sourceNode of this.nodes[i]) {
        for (const targetNode of this.nodes[i + 1]) {
          edges.push({ source: sourceNode.name, target: targetNode.name });
        }
      }
    }
    return edges;
  }

  level(...nodes: Node[]) {
    return new Graph(
      {
        ...this.context,
        ...Object.fromEntries(nodes.map((node) => [node.name, null])),
      },
      [...this.nodes, nodes]
    );
  }

  async execute(cb: (node: Node, context: object) => void = () => {}) {}
}

export type Flow<T extends object> = (params: T) => Graph;

// import * as ts from "typescript";
// import * as path from "path";
// import * as glob from "glob";

// export function getSignatures(directoryPath: string): object {
//   const files = glob.sync(path.join(directoryPath, "**/*.ts"));

//   const program = ts.createProgram(files, {
//     target: ts.ScriptTarget.Latest,
//     module: ts.ModuleKind.CommonJS,
//     noResolve: false,
//     skipLibCheck: true,
//   });

//   const typeChecker = program.getTypeChecker();

//   files.forEach((filePath) => {
//     const sourceFile = program.getSourceFile(filePath);
//     if (!sourceFile) return;

//     function visit(node: ts.Node) {
//       if (ts.isFunctionDeclaration(node)) {
//         const name = node.name?.getText() ?? "<anonymous>";
//         const typeParameters = getTypeParameters(node);
//         const parameters = getParameters(node);
//         const returnType = typeChecker.typeToString(
//           typeChecker.getReturnTypeOfSignature(
//             typeChecker.getSignatureFromDeclaration(node)
//           ),
//           undefined,
//           ts.TypeFormatFlags.NoTruncation |
//             ts.TypeFormatFlags.WriteClassExpressionAsTypeLiteral |
//             ts.TypeFormatFlags.WriteArrowStyleSignature |
//             ts.TypeFormatFlags.MultilineObjectLiterals
//         );

//         `function ${name}${typeParameters}(${parameters})${returnType}`;
//       }
//       if (signature) {
//         const { line } = sourceFile.getLineAndCharacterOfPosition(
//           node.getStart()
//         );
//         functionSignatures.push({
//           fileName: path.basename(filePath),
//           fullPath: filePath,
//           signature,
//           startLine: line + 1,
//         });
//       }

//       ts.forEachChild(node, visit);
//     }

//     visit(sourceFile);
//   });

//   return functionSignatures;
// }

// function getTypeParameters(node: ts.SignatureDeclaration): string {
//   if (!node.typeParameters?.length) return "";

//   const typeParams = node.typeParameters.map((tp) => {
//     const constraint = tp.constraint
//       ? ` extends ${tp.constraint.getText()}`
//       : "";
//     const defaultType = tp.default ? ` = ${tp.default.getText()}` : "";
//     return `${tp.name.getText()}${constraint}${defaultType}`;
//   });

//   return `<${typeParams.join(", ")}>`;
// }

// function getParameters(node: ts.SignatureDeclaration): string {
//   return node.parameters
//     .map((param) => {
//       const name = param.name.getText();
//       const optional = param.questionToken ? "?" : "";
//       const type = param.type ? `: ${param.type.getText()}` : "";
//       const defaultValue = param.initializer
//         ? ` = ${param.initializer.getText()}`
//         : "";
//       return `${name}${optional}${type}${defaultValue}`;
//     })
//     .join(", ");
// }

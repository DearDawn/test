const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

// 入口 JS 文件路径（您可以自己定义）
const entryFilePath = path.join(__dirname, './module1.js');

// 读取并解析入口文件的依赖关系
const moduleDeps = {};
parseDeps(entryFilePath, moduleDeps);

console.log('[dodo] ', 'moduleDeps', moduleDeps)
// 将所有依赖的模块转换成可以识别的格式
let allModulesCode = '';
for (const [modulePath, deps] of Object.entries(moduleDeps)) {
  allModulesCode += `__webpack_require__.register("${modulePath}", function(exports, require) {\n${fs.readFileSync(modulePath, { encoding: 'utf8' })}\n});\n`;
}
allModulesCode += `__webpack_require__("${entryFilePath}");`; // 执行入口文件

// 将生成的 JS 代码写入到输出文件
fs.writeFileSync('./bundle1.js', allModulesCode);

console.log('Bundle created successfully!');

// 解析模块依赖关系
function parseDeps(modulePath, moduleDeps) {
  if (moduleDeps[modulePath]) return;

  const content = fs.readFileSync(modulePath, { encoding: 'utf8' });
  const parsed = acorn.parse(content);
  const requires = [];

  // 匹配 CommonJS 格式的 require 语句
  parsed.body.forEach((item) => {
    if (item.type === 'VariableDeclaration') {
      const declarations = item.declarations[0];
      console.log('[dodo] ', 'parsed.body', declarations)
      if (declarations.type === 'VariableDeclarator' && declarations.init.type === "CallExpression" && declarations.init.callee.name === 'require') {
        requires.push(path.join(__dirname, declarations.init.arguments[0].value));
      }
    }
  });

  // 将依赖写入依赖哈希表中
  moduleDeps[modulePath] = requires;

  requires.forEach((depPath) => {
    const resolvedPath = path.resolve(path.dirname(modulePath), depPath); // 解析相对路径、绝对路径或模块名
    parseDeps(resolvedPath, moduleDeps);
  });
}
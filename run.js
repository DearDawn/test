const fs = require('fs');
const path = require('path');

const currentDir = __dirname;
const htmlFiles = [];

// 遍历当前目录下的所有 HTML 文件
fs.readdirSync(currentDir).forEach(file => {
  if (path.extname(file) === '.html' && file !== 'index.html') {
    htmlFiles.push({ name: file.slice(0, -5) });
  }
});

// 将结果输出到 json 文件
fs.writeFileSync('pages.json', JSON.stringify(htmlFiles, null, 2));

console.log('HTML 文件信息已成功输出到 html_files.json');

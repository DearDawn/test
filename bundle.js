const moduleCache = {};

function __webpack_require__(moduleId) {
  if (moduleCache[moduleId]) {
    return moduleCache[moduleId].exports;
  }

  const module = moduleCache[moduleId] = { exports: {} };

  moduleCache[moduleId](module, module.exports, __webpack_require__);

  return module.exports;
}

__webpack_require__.register = (moduleId, fn) => {
  const module = moduleCache[moduleId] = { exports: {} }
  fn(module.exports, __webpack_require__);
}

__webpack_require__.register("/Users/tangqiuqiu/Work/Dawn/test/pack/module1.js", function (exports, require) {
  const { say } = require('./module2')
  say('hello')
});
__webpack_require__("/Users/tangqiuqiu/Work/Dawn/test/pack/module1.js");
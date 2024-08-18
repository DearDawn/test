const moduleCache = {};

function __webpack_require__(moduleId) {
  if (moduleCache[moduleId]) {
    moduleCache[moduleId].fn(moduleCache[moduleId].exports, __webpack_require__);

    return moduleCache[moduleId].exports;
  }

  const module = moduleCache[moduleId] = { exports: {}, fn: () => { } };

  module.fn(module.exports, __webpack_require__);

  return module.exports;
}

__webpack_require__.register = (moduleId, fn) => {
  const module = moduleCache[moduleId] = { exports: {}, fn }
  // fn(module.exports, __webpack_require__);
}

__webpack_require__.register("/Users/tangqiuqiu/Work/Dawn/test/pack/module1.js", function (exports, require) {
  const module2 = require('/Users/tangqiuqiu/Work/Dawn/test/pack/module2.js')
  module2.say('hello')
});
__webpack_require__.register("/Users/tangqiuqiu/Work/Dawn/test/pack/module2.js", function (exports, require) {
  const say = (word = '') => {
    console.log('[dodo] ', 'say:', word)
  }

  exports.say = say
});

__webpack_require__("/Users/tangqiuqiu/Work/Dawn/test/pack/module1.js");
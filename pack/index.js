(function (modules) {
  const moduleCache = {};

  function __webpack_require__(moduleId) {
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    const module = moduleCache[moduleId] = {
      exports: {}
    };

    modules[moduleId](module, module.exports, __webpack_require__);

    return module.exports;
  }

  return __webpack_require__(0);
})([
  (function (module, exports, __webpack_require__) {
    const greet = __webpack_require__(1);

    greet.sayHello('Lucy');
  }),
  (function (module, exports) {
    exports.sayHello = function (name) {
      console.log(`Hello, ${name}!`)
    };
  })
]);
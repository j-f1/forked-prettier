"use strict";

const { version } = require("./package.json");

const core = require("./src/main/core");
const { getSupportInfo } = require("./src/main/support");
const getFileInfo = require("./src/common/get-file-info");
const sharedUtil = require("./src/common/util-shared");
const loadPlugins = require("./src/common/load-plugins");

const config = require("./src/config/resolve-config");

const doc = require("./src/doc");

// Luckily `opts` is always the 2nd argument
function _withPlugins(fn) {
  return function(...args) {
    const opts = args[1] || {};
    args[1] = Object.assign({}, opts, {
      plugins: loadPlugins(opts.plugins, opts.pluginSearchDirs)
    });
    return fn(...args);
  };
}

function withPlugins(fn) {
  const resultingFn = _withPlugins(fn);
  if (fn.sync) {
    resultingFn.sync = _withPlugins(fn.sync);
  }
  return resultingFn;
}

const formatWithCursor = withPlugins(core.formatWithCursor);

module.exports = {
  formatWithCursor,

  format(text, opts) {
    return formatWithCursor(text, opts).formatted;
  },

  check(text, opts) {
    const { formatted } = formatWithCursor(text, opts);
    return formatted === text;
  },

  doc,

  resolveConfig: config.resolveConfig,
  resolveConfigFile: config.resolveConfigFile,
  clearConfigCache: config.clearCache,

  getFileInfo: withPlugins(getFileInfo),
  getSupportInfo: withPlugins(getSupportInfo),

  version,

  util: sharedUtil,

  /* istanbul ignore next */
  __debug: {
    parse: withPlugins(core.parse),
    formatAST: withPlugins(core.formatAST),
    formatDoc: withPlugins(core.formatDoc),
    printToDoc: withPlugins(core.printToDoc),
    printDocToString: withPlugins(core.printDocToString)
  }
};

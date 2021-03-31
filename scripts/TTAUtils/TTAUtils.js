import _ from '../lib/TTALodash.js';

const CONSTANTS = {
  MODULE_NAME: 'token-tooltip-alt',
  MODULE_TITLE: 'Token Tooltip Alt',
  DEBUG: false,
  TRACE: true,
  CONSOLE_COLORS: ['background: #222; color: #bada55', 'color: #fff'],
};

/**
 * Generates the console output
 *
 * @param {string[]} output
 * @return {*[]}
 */
function consoleOutput(output) {
  return _.flatten([
    `%c${CONSTANTS.MODULE_TITLE} %c|`,
    CONSTANTS.CONSOLE_COLORS,
    output,
  ]);
}

/* eslint-disable no-console */
/**
 * console.log the output with the module styling
 *
 * @param {string[]} output
 */
function consoleLog(output) {
  console.log(...consoleOutput(output));
}

/**
 * Groups the output with a console.trace
 *
 * @param {string[]} output
 */
function consoleTrace(output) {
  console.groupCollapsed(...consoleOutput(output));
  console.trace();
  console.groupEnd();
}
/* eslint-enable no-console */

/**
 * console.log or
 *
 * @param {string} output
 */
function debug(...output) {
  const isDebugOptionTrue = game.settings.get(this.moduleName, 'debugOutput');
  if (!(CONSTANTS.DEBUG || isDebugOptionTrue)) return;

  if (CONSTANTS.TRACE) consoleTrace(output); else consoleLog(output);
}

/**
 * Clone an object in depth
 *
 * @param {*} obj
 * @return {*}
 */
function clone(obj) {
  return _.cloneDeep(obj);
}

/**
 * Returns the internationalization for a given string
 *
 * @param {string} path
 * @return {string}
 */
function i18n(path) {
  return game.i18n.localize(`${this.moduleName}.${path}`);
}

/**
 * Generates a random color in the #FFFFFF format
 *
 * @return {string}
 */
function generateRandomColor() {
  return `#${Math.round((Math.random() * 0xFFFFFF)).toString(16).padStart(6, '0')}`;
}

export default {
  MODULE_NAME: CONSTANTS.MODULE_NAME,
  MODULE_TITLE: CONSTANTS.MODULE_TITLE,
  debug,
  clone,
  i18n,
  generateRandomColor,
};

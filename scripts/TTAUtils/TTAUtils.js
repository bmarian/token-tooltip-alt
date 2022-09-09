const MODULE_NAME = 'token-tooltip-alt';
const MODULE_TITLE = 'Token Tooltip Alt';
const DEBUG = false;
const TRACE = true;
const CONSOLE_COLORS = ['background: #222; color: #bada55', 'color: #fff'];

/**
 * Generates the console output
 *
 * @param {string[]} output
 * @return {*[]}
 */
function consoleOutput(output) {
  return [
    `%c${MODULE_TITLE} %c|`,
    ...CONSOLE_COLORS,
    ...output,
  ];
}

/* eslint-disable no-console */
/**
 * console.log the output with the module styling
 *
 * @param {*[]} output
 */
function consoleLog(output) {
  console.log(...consoleOutput(output));
}

/**
 * Groups the output with a console.trace
 *
 * @param {*[]} output
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
 * @param {*} output
 */
function debug(...output) {
  const isDebugOptionTrue = game.settings.get(MODULE_NAME, 'debugOutput');
  if (!(DEBUG || isDebugOptionTrue)) return;

  if (TRACE) consoleTrace(output); else consoleLog(output);
}

/**
 * Clone an object in depth
 *
 * @param {*} obj
 * @return {*}
 */
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Returns the internationalization for a given string
 *
 * @param {string} path
 * @return {string}
 */
function i18n(path) {
  return game.i18n.localize(`${MODULE_NAME}.${path}`);
}

/**
 * Generates a random color in the #FFFFFF format
 *
 * @return {string}
 */
function generateRandomColor() {
  return `#${Math.round((Math.random() * 0xFFFFFF)).toString(16).padStart(6, '0')}`;
}

/**
 * Creates a new html element from a given string
 *
 * @param {String} html representing a single element
 * @return {Node}
 */
function htmlToElement(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild;
}
/**
 * Returns the foundry version
 *
 * @return {number | string | undefined}
 */
const getFoundryVersion = () => game?.version;

/**
 * Returns if the foundry version is 0.8.x
 *
 * @return {boolean}
 */
const versionAfter9 = () => Number(getFoundryVersion()) >= 9;

const versionAfter10 = () => Number(getFoundryVersion()) >= 10;

export {
  debug,
  clone,
  i18n,
  generateRandomColor,
  htmlToElement,
  versionAfter9,
  versionAfter10,
  MODULE_NAME,
  MODULE_TITLE,
};

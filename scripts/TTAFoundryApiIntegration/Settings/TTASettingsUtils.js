import { MODULE_NAME } from '../../TTAUtils/TTAUtils.js';

/**
 * Register a setting for a given key
 *
 * @param {string} key
 * @param {any} data
 */
function registerSetting(key, data) {
  game.settings.register(MODULE_NAME, key, data);
}

/**
 * Returns the settings for a given key
 *
 * @param {string} key
 * @return {any}
 */
function getSetting(key) {
  return game.settings.get(MODULE_NAME, key);
}

/**
 * Set the settings for a given key
 *
 * @param {string} key
 * @param {any} data
 * @return {Promise<any>}
 */
function setSetting(key, data) {
  return game.settings.set(MODULE_NAME, key, data);
}

/**
 * Set synchronously the settings for a given key
 *
 * @param {string} key
 * @param {any} data
 * @return {Promise<void>}
 */
async function setSettingSync(key, data) {
  await setSetting(key, data);
}

/**
 * Register an array of settings
 *
 * @param {{key: string, settings: any}[]}items
 */
function registerSettings(items) {
  items.forEach((item) => registerSetting(item.key, item.settings));
}

/**
 * Register a menu for a given key
 *
 * @param {string} key
 * @param {any} data
 */
function registerMenu(key, data) {
  game.settings.registerMenu(MODULE_NAME, key, data);
}

export {
  getSetting,
  setSetting,
  setSettingSync,
  registerSettings,
  registerMenu,
};

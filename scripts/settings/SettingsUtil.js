import { MODULE_NAME } from '../TTAUtils/TTAUtils.js';

class SettingsUtil {
  constructor() {
    this._moduleName = MODULE_NAME;
  }

  static getInstance() {
    if (!SettingsUtil._instance) { SettingsUtil._instance = new SettingsUtil(); }
    return SettingsUtil._instance;
  }

  // gets the value of a setting
  getSetting(key) {
    return game.settings.get(this._moduleName, key);
  }

  // sets a value for a setting
  async setSetting(key, data) {
    return await game.settings.set(MODULE_NAME, key, data);
  }

  // registers a setting
  _registerSetting(key, data) {
    game.settings.register(MODULE_NAME, key, data);
  }

  // registers an array of settings
  registerSettings(items) {
    const su = this;
    items.forEach((item) => {
      su._registerSetting(item.key, item.settings);
    });
  }

  // registers a menu
  registerMenu(key, data) {
    game?.settings?.registerMenu(this._moduleName, key, data);
  }
}
export default SettingsUtil.getInstance();

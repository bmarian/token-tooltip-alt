import { TTAConstants } from '../TTAConstants/TTAConstants.js';
import { debug, MODULE_NAME } from '../TTAUtils/TTAUtils.js';
import { getSetting, setSettingSync } from '../TTAFoundryApiIntegration/Settings/TTASettingsUtils.js';

export default class DataManager extends FormApplication {
  constructor() {
    super(...arguments);
    this._advancedEditor = null;
  }

  static get defaultOptions() {
    return {
      ...super.defaultOptions,
      title: 'Data Manager',
      id: 'data-manager',
      template: TTAConstants.APPS.DATA_MANAGER,
      width: TTAConstants.APPS.DATA_MANAGER_WIDTH,
      height: TTAConstants.APPS.DATA_MANAGER_HEIGHT,
      classes: [`${MODULE_NAME}-data-manager-window`],
      closeOnSubmit: true,
      submitOnClose: false,
    };
  }

  // get a value from Settings
  _getSetting(key) {
    return getSetting(key);
  }

  // get a value from Settings
  async _setSetting(key, value) {
    return setSettingSync(key, value);
  }

  // determines the type of data manager
  _isImport() {
    return this?.object?.type === 'import';
  }

  _exportData() {
    const gmSettings = this._getSetting(TTAConstants.SETTING_KEYS.GM_SETTINGS);
    const playerSettings = this._getSetting(TTAConstants.SETTING_KEYS.PLAYER_SETTINGS);
    const data = { gmSettings, playerSettings };
    return JSON.stringify(data, null, 2);
  }

  // returns an empty string for import and the stringified data object if export
  _getSettings() {
    return this._isImport() ? '' : this._exportData();
  }

  // returns the data used by the tooltip-manager.hbs template
  // eslint-disable-next-line no-unused-vars
  async getData(options) {
    return {
      moduleName: MODULE_NAME,
      isImport: this._isImport(),
    };
  }

  _getSubmitData(...args) {
    if (this._advancedEditor) { this._advancedEditor.save(); }
    return super._getSubmitData(...args);
  }

  async _updateObject(event, formData) {
    const stringData = formData.data;
    try {
      const data = JSON.parse(stringData);
      const { gmSettings } = data;
      const { playerSettings } = data;
      if (!gmSettings || !playerSettings) { return; }
      await this._setSetting(TTAConstants.SETTING_KEYS.GM_SETTINGS, gmSettings);
      await this._setSetting(TTAConstants.SETTING_KEYS.PLAYER_SETTINGS, playerSettings);
      debug(data);
    } catch (err) {
      debug(`Error on importing: ${err}`);
    }
  }

  activateListeners($html) {
    super.activateListeners($html);
    const $dataManager = $html.find('.data-manager');
    if (!$dataManager) { return; }
    const settings = this._getSettings();
    $dataManager.val(settings);
    this._advancedEditor = CodeMirror.fromTextArea($dataManager[0], {
      ...CodeMirror.userSettings,
      mode: 'javascript',
      inputStyle: 'contenteditable',
      lineNumbers: true,
      autofocus: this._isImport(),
      readOnly: !this._isImport(),
    });
  }
}

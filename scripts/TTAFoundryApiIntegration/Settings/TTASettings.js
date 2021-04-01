import { TTAConstants } from '../../TTAConstants/TTAConstants.js';
import TooltipManager from '../../apps/TooltipManager.js';
import { i18n } from '../../TTAUtils/TTAUtils.js';
import { registerMenu, registerSettings } from './TTASettingsUtils.js';

class TTASettings {
  constructor() {
    this._settingKeys = TTAConstants.SETTING_KEYS;
    this._publicConfigureSettings = [
      {
        key: this._settingKeys.TOOLTIP_POSITION,
        settings: {
          name: i18n('settings.TOOLTIP_POSITION.name'),
          hint: i18n('settings.TOOLTIP_POSITION.hint'),
          type: String,
          config: true,
          default: 'right',
          choices: {
            top: i18n('settings.TOOLTIP_POSITION.choices.top'),
            right: i18n('settings.TOOLTIP_POSITION.choices.right'),
            bottom: i18n('settings.TOOLTIP_POSITION.choices.bottom'),
            left: i18n('settings.TOOLTIP_POSITION.choices.left'),
            overlay: i18n('settings.TOOLTIP_POSITION.choices.overlay'),
            surprise: i18n('settings.TOOLTIP_POSITION.choices.surprise'),
            doubleSurprise: i18n('settings.TOOLTIP_POSITION.choices.doubleSurprise'),
          },
        },
      },
      {
        key: this._settingKeys.FONT_SIZE,
        settings: {
          name: i18n('settings.FONT_SIZE.name'),
          hint: i18n('settings.FONT_SIZE.hint'),
          type: Number,
          config: true,
          range: {
            min: 1,
            step: 0.1,
            max: 2.5,
          },
          default: 1.2,
        },
      },
      {
        key: this._settingKeys.MAX_ROWS,
        settings: {
          name: i18n('settings.MAX_ROWS.name'),
          hint: i18n('settings.MAX_ROWS.hint'),
          type: Number,
          config: true,
          range: {
            min: 1,
            step: 1,
            max: 20,
          },
          default: 5,
        },
      },
      {
        key: this._settingKeys.DATA_SOURCE,
        settings: {
          name: i18n('settings.DATA_SOURCE.name'),
          hint: i18n('settings.DATA_SOURCE.hint'),
          type: String,
          scope: 'world',
          config: true,
          restricted: true,
          default: 'actor.data.data',
        },
      },
      {
        key: this._settingKeys.DARK_THEME,
        settings: {
          name: i18n('settings.DARK_THEME.name'),
          hint: i18n('settings.DARK_THEME.hint'),
          type: Boolean,
          config: true,
          default: false,
        },
      },
      {
        key: this._settingKeys.SHOW_ALL_ON_ALT,
        settings: {
          name: i18n('settings.SHOW_ALL_ON_ALT.name'),
          hint: i18n('settings.SHOW_ALL_ON_ALT.hint'),
          type: Boolean,
          scope: 'world',
          config: true,
          restricted: true,
          default: true,
        },
      },
      {
        key: this._settingKeys.SHOW_TOOLTIP_FOR_HIDDEN_TOKENS,
        settings: {
          name: i18n('settings.SHOW_TOOLTIP_FOR_HIDDEN_TOKENS.name'),
          hint: i18n('settings.SHOW_TOOLTIP_FOR_HIDDEN_TOKENS.hint'),
          type: Boolean,
          scope: 'world',
          config: true,
          restricted: true,
          default: false,
        },
      },
      {
        key: this._settingKeys.ISOMETRIC,
        settings: {
          name: i18n('settings.ISOMETRIC.name'),
          hint: i18n('settings.ISOMETRIC.hint'),
          type: Boolean,
          scope: 'world',
          config: true,
          restricted: true,
          default: false,
        },
      },
      {
        key: this._settingKeys.DEBUG_OUTPUT,
        settings: {
          name: i18n('settings.DEBUG_OUTPUT.name'),
          hint: i18n('settings.DEBUG_OUTPUT.hint'),
          type: Boolean,
          scope: 'world',
          config: true,
          restricted: true,
          default: false,
        },
      },
    ];
    this._hiddenConfigureSettings = [
      {
        key: this._settingKeys.GM_SETTINGS,
        settings: {
          type: Object,
          scope: 'world',
          restricted: true,
          default: {},
        },
      },
      {
        key: this._settingKeys.PLAYER_SETTINGS,
        settings: {
          type: Object,
          scope: 'world',
          restricted: true,
          default: {},
        },
      },
      {
        key: this._settingKeys.ACTORS,
        settings: {
          type: Object,
          scope: 'world',
          restricted: true,
          default: [],
        },
      },
      {
        key: this._settingKeys.CLIPBOARD,
        settings: {
          type: Object,
          default: [],
        },
      },
    ];
  }

  static getInstance() {
    if (!TTASettings._instance) { TTASettings._instance = new TTASettings(); }
    return TTASettings._instance;
  }

  // --- GETTERS --- \\
  getPublicConfigureSettings() {
    return this._publicConfigureSettings;
  }

  getHiddenConfigureSettings() {
    return this._hiddenConfigureSettings;
  }

  // --- GETTERS --- \\
  _registerTooltipManager() {
    registerMenu(TTAConstants.SETTING_KEYS.TOOLTIP_MANAGER, {
      name: i18n('settings.TOOLTIP_MANAGER.name'),
      label: i18n('settings.TOOLTIP_MANAGER.label'),
      icon: 'fas fa-edit',
      type: TooltipManager,
      restricted: true,
    });
  }

  // makes a big list from all the available settings and registers them
  registerSettings() {
    const settings = [
      ...this._publicConfigureSettings,
      ...this._hiddenConfigureSettings,
    ];
    this._registerTooltipManager();
    registerSettings(settings);
  }
}
export default TTASettings;

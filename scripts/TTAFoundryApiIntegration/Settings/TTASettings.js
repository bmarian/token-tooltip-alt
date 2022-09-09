import { TTAConstants } from '../../TTAConstants/TTAConstants.js';
import TooltipManager from '../../apps/TooltipManager.js';
import { i18n, versionAfter10 } from '../../TTAUtils/TTAUtils.js';
import { registerMenu, registerSettings } from './TTASettingsUtils.js';

const { SETTING_KEYS } = TTAConstants;

/**
 * Registers the tooltip manager menu
 */
function registerTooltipManager() {
  registerMenu(TTAConstants.SETTING_KEYS.TOOLTIP_MANAGER, {
    name: i18n('settings.TOOLTIP_MANAGER.name'),
    label: i18n('settings.TOOLTIP_MANAGER.label'),
    icon: 'fas fa-edit',
    type: TooltipManager,
    restricted: true,
  });
}

/**
 * Registers the menu and the public and hidden settings
 */
function initSettings() {
  const PUBLIC_CONFIGURE_SETTINGS = [
    {
      key: SETTING_KEYS.TOOLTIP_POSITION,
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
      key: SETTING_KEYS.FONT_SIZE,
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
      key: SETTING_KEYS.MAX_ROWS,
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
      key: SETTING_KEYS.DATA_SOURCE,
      settings: {
        name: i18n('settings.DATA_SOURCE.name'),
        hint: i18n('settings.DATA_SOURCE.hint'),
        type: String,
        scope: 'world',
        config: true,
        restricted: true,
        default: versionAfter10() ? 'actor.system' : 'actor.data.data',
      },
    },
    {
      key: SETTING_KEYS.DARK_THEME,
      settings: {
        name: i18n('settings.DARK_THEME.name'),
        hint: i18n('settings.DARK_THEME.hint'),
        type: Boolean,
        config: true,
        default: false,
      },
    },
    {
      key: SETTING_KEYS.SHOW_ALL_ON_ALT,
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
      key: SETTING_KEYS.SHOW_TOOLTIP_FOR_HIDDEN_TOKENS,
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
      key: SETTING_KEYS.DEBUG_OUTPUT,
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
  const HIDDEN_CONFIGURE_SETTINGS = [
    {
      key: SETTING_KEYS.GM_SETTINGS,
      settings: {
        type: Object,
        scope: 'world',
        restricted: true,
        default: {},
      },
    },
    {
      key: SETTING_KEYS.PLAYER_SETTINGS,
      settings: {
        type: Object,
        scope: 'world',
        restricted: true,
        default: {},
      },
    },
    {
      key: SETTING_KEYS.ACTORS,
      settings: {
        type: Object,
        scope: 'world',
        restricted: true,
        default: [],
      },
    },
    {
      key: SETTING_KEYS.CLIPBOARD,
      settings: {
        type: Object,
        default: [],
      },
    },
  ];

  registerTooltipManager();
  registerSettings([...PUBLIC_CONFIGURE_SETTINGS, ...HIDDEN_CONFIGURE_SETTINGS]);
}

export { initSettings };

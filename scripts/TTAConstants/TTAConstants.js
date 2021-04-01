import { MODULE_NAME } from '../TTAUtils/TTAUtils.js';

const TTAConstants = {
  SETTING_KEYS: {
    TOOLTIP_VISIBILITY: 'tooltipVisibility',
    SHOW_ALL_ON_ALT: 'showAllOnAlt',
    SHOW_TOOLTIP_FOR_HIDDEN_TOKENS: 'showTooltipForHiddenTokens',
    DISPLAY_NAMES_IN_TOOLTIP: 'displayNameInTooltip',
    DEBUG_OUTPUT: 'debugOutput',
    FONT_SIZE: 'fontSize',
    MAX_ROWS: 'maxRows',
    USE_ACCENT_COLOR_FOR_EVERYTHING: 'useAccentColorForEverything',
    ACCENT_COLOR: 'accentColor',
    TOKEN_DISPOSITIONS: 'tokenDispositions',
    TOOLTIP_POSITION: 'tooltipPosition',
    DARK_THEME: 'darkTheme',
    DATA_SOURCE: 'dataSource',
    GM_SETTINGS: 'gmSettings',
    PLAYER_SETTINGS: 'playerSettings',
    TOOLTIP_MANAGER: 'tooltipManager',
    ACTORS: 'actors',
    CLIPBOARD: 'clipboard',
    ISOMETRIC: 'isometric',
  },
  TEMPLATES: {
    TOOLTIP: `modules/${MODULE_NAME}/templates/tooltip.hbs`,
    TOOLTIP_EDITOR_GM: `modules/${MODULE_NAME}/templates/tooltip-editor-gm.hbs`,
    TOOLTIP_EDITOR_PLAYER: `modules/${MODULE_NAME}/templates/tooltip-editor-player.hbs`,
    TOOLTIP_EDITOR_TABLE: `modules/${MODULE_NAME}/templates/tooltip-editor-table.hbs`,
    TOOLTIP_EDITOR_TABLE_ROW: `modules/${MODULE_NAME}/templates/tooltip-editor-table-row.hbs`,
  },
  APPS: {
    TOOLTIP_MANAGER: `modules/${MODULE_NAME}/templates/tooltip-manager.hbs`,
    TOOLTIP_MANAGER_WIDTH: 500,
    DATA_MANAGER: `modules/${MODULE_NAME}/templates/data-manager.hbs`,
    DATA_MANAGER_WIDTH: 600,
    DATA_MANAGER_HEIGHT: 700,
    TOOLTIP_EDITOR: `modules/${MODULE_NAME}/templates/tooltip-editor.hbs`,
    TOOLTIP_EDITOR_ROW: `modules/${MODULE_NAME}/templates/tooltip-editor-row.hbs`,
    TOOLTIP_EDITOR_WIDTH: 600,
    TOOLTIP_DEFAULT_ACTOR_ID: 'default',
    OWNED_DISPOSITION: 'OWNED',
    NONE_DISPOSITION: 'NONE',
    ADVANCED_EDITOR: `modules/${MODULE_NAME}/templates/advanced-editor.hbs`,
    ADVANCED_EDITOR_WIDTH: 600,
    ADVANCED_EDITOR_HEIGHT: 700,
  },
  SYSTEM_DEFAULT: 'default',
  SYSTEM_DEFAULT_THEMES: {
    default: 'default',
  },
  TOOLTIP_POSITIONS: ['top', 'right', 'bottom', 'left', 'overlay'],
};

function getSystemTheme() {
  const system = game.system.id;
  return TTAConstants.SYSTEM_DEFAULT_THEMES[system]
    || TTAConstants.SYSTEM_DEFAULT_THEMES[TTAConstants.SYSTEM_DEFAULT];
}

export {
  TTAConstants,
  getSystemTheme,
};

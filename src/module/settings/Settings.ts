import {CONSTANTS} from "../enums/Constants";
import SettingsUtil from "./SettingsUtil";
import TooltipManager from "../../apps/TooltipManager";
import Utils from "../Utils";

class Settings {
    private static _instance: Settings;

    private constructor() {
    }

    public static getInstance(): Settings {
        if (!Settings._instance) Settings._instance = new Settings();
        return Settings._instance;
    }

    private _settingKeys = CONSTANTS.SETTING_KEYS;

    private _publicConfigureSettings = [
        {
            key: this._settingKeys.TOOLTIP_POSITION,
            settings: {
                name: Utils.i18n('settings.TOOLTIP_POSITION.name'),
                hint: Utils.i18n('settings.TOOLTIP_POSITION.hint'),
                type: String,
                config: true,
                default: "right",
                choices: {
                    "top": Utils.i18n('settings.TOOLTIP_POSITION.choices.top'),
                    "right": Utils.i18n('settings.TOOLTIP_POSITION.choices.right'),
                    "bottom": Utils.i18n('settings.TOOLTIP_POSITION.choices.bottom'),
                    "left": Utils.i18n('settings.TOOLTIP_POSITION.choices.left'),
                    "overlay": Utils.i18n('settings.TOOLTIP_POSITION.choices.overlay'),
                    "surprise": Utils.i18n('settings.TOOLTIP_POSITION.choices.surprise'),
                    "doubleSurprise": Utils.i18n('settings.TOOLTIP_POSITION.choices.doubleSurprise'),
                }
            },
        },
        {
            key: this._settingKeys.FONT_SIZE,
            settings: {
                name: Utils.i18n('settings.FONT_SIZE.name'),
                hint: Utils.i18n('settings.FONT_SIZE.hint'),
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
                name: Utils.i18n('settings.MAX_ROWS.name'),
                hint: Utils.i18n('settings.MAX_ROWS.hint'),
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
                name: Utils.i18n('settings.DATA_SOURCE.name'),
                hint: Utils.i18n('settings.DATA_SOURCE.hint'),
                type: String,
                scope: "world",
                config: true,
                restricted: true,
                default: 'actor.data.data',
            },
        },
        {
            key: this._settingKeys.DARK_THEME,
            settings: {
                name: Utils.i18n('settings.DARK_THEME.name'),
                hint: Utils.i18n('settings.DARK_THEME.hint'),
                type: Boolean,
                config: true,
                default: false,
            },
        },
        {
            key: this._settingKeys.SHOW_ALL_ON_ALT,
            settings: {
                name: Utils.i18n('settings.SHOW_ALL_ON_ALT.name'),
                hint: Utils.i18n('settings.SHOW_ALL_ON_ALT.hint'),
                type: Boolean,
                scope: "world",
                config: true,
                restricted: true,
                default: true,
            },
        },
        {
            key: this._settingKeys.SHOW_TOOLTIP_FOR_HIDDEN_TOKENS,
            settings: {
                name: Utils.i18n('settings.SHOW_TOOLTIP_FOR_HIDDEN_TOKENS.name'),
                hint: Utils.i18n('settings.SHOW_TOOLTIP_FOR_HIDDEN_TOKENS.hint'),
                type: Boolean,
                scope: "world",
                config: true,
                restricted: true,
                default: false,
            },
        },
        {
            key: this._settingKeys.ISOMETRIC,
            settings: {
                name: Utils.i18n('settings.ISOMETRIC.name'),
                hint: Utils.i18n('settings.ISOMETRIC.hint'),
                type: Boolean,
                scope: "world",
                config: true,
                restricted: true,
                default: false,
            },
        },
        {
            key: this._settingKeys.DEBUG_OUTPUT,
            settings: {
                name: Utils.i18n('settings.DEBUG_OUTPUT.name'),
                hint: Utils.i18n('settings.DEBUG_OUTPUT.hint'),
                type: Boolean,
                scope: "world",
                config: true,
                restricted: true,
                default: true,
            },
        },
    ];
    private _hiddenConfigureSettings = [
        {
            key: this._settingKeys.GM_SETTINGS,
            settings: {
                type: Object,
                scope: "world",
                restricted: true,
                default: {},
            },
        },
        {
            key: this._settingKeys.PLAYER_SETTINGS,
            settings: {
                type: Object,
                scope: "world",
                restricted: true,
                default: {},
            },
        },
        {
            key: this._settingKeys.ACTORS,
            settings: {
                type: Object,
                scope: "world",
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
    // this is a list with all the old settings before v2.0.0
    private _oldHiddenConfigureSettings = [
        {
            key: this._settingKeys.TOOLTIP_ITEMS,
            settings: {
                type: Object,
                scope: "world",
                restricted: true,
                default: [],
            },
        },
        {
            key: this._settingKeys.HOSTILE_ITEMS,
            settings: {
                type: Object,
                scope: "world",
                restricted: true,
                default: [],
            },
        },
    ]

    // --- GETTERS --- \\
    public getPublicConfigureSettings(): any {
        return this._publicConfigureSettings;
    }

    public getHiddenConfigureSettings(): any {
        return this._hiddenConfigureSettings;
    }

    public getOldHiddenConfigureSettings(): any {
        return this._oldHiddenConfigureSettings;
    }

    // --- GETTERS --- \\

    private _registerTooltipManager(): void {
        SettingsUtil.registerMenu(CONSTANTS.SETTING_KEYS.TOOLTIP_MANAGER, {
            name: Utils.i18n('settings.TOOLTIP_MANAGER.name'),
            label: Utils.i18n('settings.TOOLTIP_MANAGER.label'),
            icon: 'fas fa-edit',
            type: TooltipManager,
            restricted: true,
        });
    }

    // makes a big list from all the available settings and registers them
    public registerSettings(): void {
        const settings = [
            ...this._publicConfigureSettings,
            ...this._hiddenConfigureSettings,
            ...this._oldHiddenConfigureSettings,
        ];
        this._registerTooltipManager();
        SettingsUtil.registerSettings(settings);
    }
}

export default Settings;
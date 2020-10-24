import {CONSTANTS} from "../enums/Constants";
import SettingsUtil from "./SettingsUtil";
import TooltipManager from "../../apps/TooltipManager";

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
                name: "Tooltip placement",
                hint: "Determine the tooltip's position.",
                type: String,
                scope: "world",
                config: true,
                restricted: true,
                default: "right",
                choices: {
                    "top": "Top",
                    "right": "Right",
                    "bottom": "Bottom",
                    "left": "Left",
                    "surprise": "Surprise me"
                }
            },
        },
        {
            key: this._settingKeys.FONT_SIZE,
            settings: {
                name: "Font size",
                hint: "Customize the tooltip's font size (e.g. 1.2rem | 15px).",
                type: String,
                config: true,
                default: '1rem',
            },
        },
        {
            key: this._settingKeys.DATA_SOURCE,
            settings: {
                name: "Data source",
                hint: "This is an advanced feature, please don't change it if you don't know what you are doing. " +
                    "This will determine from where the tooltip data is pulled.",
                type: String,
                scope: "world",
                config: true,
                restricted: true,
                default: 'actor.data.data',
            },
        },
        {
            key: this._settingKeys.DONT_SHOW,
            settings: {
                name: "Exception",
                hint: "If one of the tracked values is equal to this one, that token will not display a tooltip. " +
                    "Leave blank if you want a tooltip for every token.",
                type: String,
                scope: "world",
                config: true,
                restricted: true,
                default: '',
            },
        },
        {
            key: this._settingKeys.SHOW_ALL_ON_ALT,
            settings: {
                name: "Show on <ALT>",
                hint: "Display a tooltip for every visible token on the scene.",
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
                name: "Show all on <ALT>",
                hint: "Display a tooltips for every token on the scene. Dose nothing if 'Show on <ALT>' is set to false.",
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
                name: "Debug output",
                hint: "Display some useful debug information in the console.",
                type: Boolean,
                scope: "world",
                config: true,
                restricted: true,
                default: false,
            },
        },
    ];
    private _tooltipEditorSettings = [
        {
            key: this._settingKeys.DISPLAY_NAMES_IN_TOOLTIP,
            settings: {
                name: "Display token name",
                hint: "Display the token name in the tooltip.",
                type: Boolean,
                scope: "world",
                restricted: true,
                default: false,
            },
            custom: {
                type: 'checkbox',
                dataDtype: 'Boolean',
                isCheckbox: true,
            },
        },
        {
            key: this._settingKeys.DARK_THEME,
            settings: {
                name: "Dark theme",
                hint: "Apply a dark theme for the tooltip.",
                type: Boolean,
                scope: "world",
                restricted: true,
                default: false,
            },
            custom: {
                type: 'checkbox',
                dataDtype: 'Boolean',
                isCheckbox: true,
            },
        },
        {
            key: this._settingKeys.USE_ACCENT_COLOR_FOR_EVERYTHING,
            settings: {
                name: "Use accent color everywhere",
                hint: "Use the accent color for everything.",
                type: Boolean,
                scope: "world",
                restricted: true,
                default: false,
            },
            custom: {
                type: 'checkbox',
                dataDtype: 'Boolean',
                isCheckbox: true,
            },
        },
        {
            key: this._settingKeys.ACCENT_COLOR,
            settings: {
                name: "Accent color",
                hint: "Set a accent color for the border, and title.",
                type: String,
                scope: "world",
                restricted: true,
                default: '#000000',
            },
            custom: {
                type: 'color',
                dataDtype: 'String',
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
                default: [],
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
                default: {},
            },
        },
    ];
    // this is a list with all the old settings before v2.0.0
    private _oldHiddenConfigureSettings = [
        {
            key: this._settingKeys.PORTED,
            settings: {
                type: Boolean,
                scope: "world",
                restricted: true,
                default: false,
            },
        },
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
        {
            key: this._settingKeys.TOOLTIP_VISIBILITY,
            settings: {
                type: String,
                scope: "world",
                restricted: true,
                default: "gm",
            },
        },
    ]

    // --- GETTERS --- \\
    public getPublicConfigureSettings(): any {
        return this._publicConfigureSettings;
    }

    public getTooltipEditorSettings(): any {
        return this._tooltipEditorSettings;
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
            name: 'Tooltip manager',
            label: 'Tooltip manager',
            icon: 'fas fa-edit',
            type: TooltipManager,
            restricted: true,
        });
    }

    // makes a big list from all the available settings and registers them
    public registerSettings(): void {
        const settings = [
            ...this._publicConfigureSettings,
            ...this._tooltipEditorSettings,
            ...this._hiddenConfigureSettings,
            ...this._oldHiddenConfigureSettings,
        ];
        this._registerTooltipManager();
        SettingsUtil.registerSettings(settings);
    }
}

export default Settings.getInstance();
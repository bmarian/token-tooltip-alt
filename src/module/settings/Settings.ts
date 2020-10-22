import {CONSTANTS, getSystemTooltip} from "../enums/Constants";
import SettingsUtil from "./SettingsUtil";

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
            key: this._settingKeys.TOOLTIP_VISIBILITY,
            settings: {
                name: "Tooltip visibility",
                hint: "This option determines which tokens display a tooltip when a player hovers over them.",
                type: String,
                scope: "world",
                config: true,
                restricted: true,
                default: "gm",
                choices: {
                    "gm": "GM only",
                    "owned": "Owned/Observed tokens",
                    "friendly": "Friendly tokens",
                    "all": "All tokens"
                }
            },
        },
        {
            key: this._settingKeys.TOOLTIP_POSITION,
            settings: {
                name: "Tooltip position",
                hint: "Where should the tooltip be displayed.",
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
            key: this._settingKeys.DATA_SOURCE,
            settings: {
                name: "Data source --advanced--",
                hint: "This is an advanced feature, please don't change it if you don't know what you are doing. " +
                    "If you know, this could give you the possibility to track almost anything in the token object.",
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
                name: "Don't show",
                hint: "If one of the tracked values is equal to this one that token will not have a tooltip. " +
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
                name: "Show for hidden tokens",
                hint: "Display tooltips for hidden tokens when pressing <ALT>.",
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
                hint: "Display some useful debug output in the console.",
                type: Boolean,
                scope: "world",
                config: true,
                restricted: true,
                default: false,
            },
        },
    ];
    private _tooltipManagerSettings = [
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
            key: this._settingKeys.FONT_SIZE,
            settings: {
                name: "Font size --requires restart--",
                hint: "Customize the font size used for the tooltip (e.g. 1.2rem | 15px).",
                type: String,
                scope: "world",
                restricted: true,
                default: '1rem',
            },
            custom: {
                type: 'text',
                dataDtype: 'String',
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

    ];
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
    ]

    // makes a big list from all the available settings and registers them
    public registerSettings(): void {
        const settings = [
            ...this._publicConfigureSettings,
            ...this._tooltipManagerSettings,
            ...this._hiddenConfigureSettings,
            ...this._oldHiddenConfigureSettings,
        ];
        SettingsUtil.registerSettings(settings);
    }

    public getTooltipMangerSettings(): any {
        return this._tooltipManagerSettings;
    }
}

export default Settings.getInstance();
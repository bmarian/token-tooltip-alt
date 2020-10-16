import Utils from "./Utils";
import SettingsEditor from "../apps/SettingsEditor";

class Settings {
    private static _instance: Settings;
    private _systemSpecificDefaults = {
        'default': [
            {
                color: '#000000',
                icon: 'fa-heart',
                value: 'attributes.hp',
                expression: false,
                isNumber: false,
            },
        ],
        'dnd5e': [
            {
                color: '#000000',
                icon: 'fa-heart',
                value: 'attributes.hp',
                expression: false,
                isNumber: false,
            },
            {
                color: '#000000',
                icon: 'fa-shield-alt',
                value: 'attributes.ac.value',
                expression: false,
                isNumber: false,
            },
            {
                color: '#000000',
                icon: 'fa-shoe-prints',
                value: 'attributes.speed.value',
                expression: false,
                isNumber: true,
            },
            {
                color: '#000000',                
                icon: 'fa-eye',
                value: 'skills.prc.passive',
                expression: false,
                isNumber: false,
            },
            {
                color: '#000000',
                icon: 'fa-search',
                value: 'skills.inv.passive',
                expression: false,
                isNumber: false,
            },
        ],
        'cyphersystem': [
            {
                color: '#ff0000',
                icon: 'fa-fist-raised',
                value: 'pools.might',
                expression: false,
                isNumber: false,
            },
            {
                color: '#00ff00',
                icon: 'fa-running',
                value: 'pools.speed',
                expression: false,
                isNumber: false,
            },
            {
                color: '#0000ff',
                icon: 'fa-brain',
                value: 'pools.intellect',
                expression: false,
                isNumber: false,
            },
        ],
    }
    private _systemSpecificClasses = [];
    public templatePaths = [
        `modules/${Utils.moduleName}/templates/tooltip.hbs`,
        `modules/${Utils.moduleName}/templates/settings-editor-row.hbs`,
    ]
    public settingKeys = {
        TOOLTIP_VISIBILITY: 'tooltipVisibility',
        SHOW_ALL_ON_ALT: 'showAllOnAlt',
        SHOW_TOOLTIP_FOR_HIDDEN_TOKENS: 'showTooltipForHiddenTokens',
        DISPLAY_NAMES_IN_TOOLTIP: 'displayNameInTooltip',
        TOOLTIP_ITEMS: 'tooltipItems',
        HOSTILE_ITEMS: 'hostileItems',
        DEBUG_OUTPUT: 'debugOutput',
        FONT_SIZE: 'fontSize',
        USE_ACCENT_COLOR_FOR_EVERYTHING: 'useAccentColorForEverything',
        ACCENT_COLOR: 'accentColor',
        TOOLTIP_POSITION: 'tooltipPosition',
        DARK_THEME: 'darkTheme',
        DONT_SHOW: 'dontShow',
        DATA_SOURCE: 'dataSource',
    }
    public tooltipPositions = ["top", "right", "bottom", "left"];

    private constructor() {
    }

    public static getInstance(): Settings {
        if (!Settings._instance) Settings._instance = new Settings();
        return Settings._instance;
    }

    private _getSystemSpecificDefaults(): any {
        const systemId = game?.system?.id;
        return this._systemSpecificDefaults[systemId] || this._systemSpecificDefaults['default'];
    }

    private _getSettings(): Array<any> {
        return [
            {
                key: this.settingKeys.TOOLTIP_VISIBILITY,
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
                        "owned": "Owned tokens",
                        "friendly": "Friendly tokens",
                        "all": "All tokens"
                    }
                },
            },
            {
                key: this.settingKeys.TOOLTIP_POSITION,
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
                key: this.settingKeys.DATA_SOURCE,
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
                key: this.settingKeys.DONT_SHOW,
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
                key: this.settingKeys.SHOW_ALL_ON_ALT,
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
                key: this.settingKeys.SHOW_TOOLTIP_FOR_HIDDEN_TOKENS,
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
                key: this.settingKeys.DEBUG_OUTPUT,
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
            {
                key: this.settingKeys.TOOLTIP_ITEMS,
                settings: {
                    type: Object,
                    scope: "world",
                    restricted: true,
                    default: this._getSystemSpecificDefaults(),
                },
            },
            {
                key: this.settingKeys.HOSTILE_ITEMS,
                settings: {
                    type: Object,
                    scope: "world",
                    restricted: true,
                    default: [],
                },
            },
            ...this.getSettingsEditorOptions(),
        ];
    }

    private _registerMenu(): void {
        game.settings.registerMenu(Utils.moduleName, 'settingsEditor', {
            name: 'Tooltip editor',
            hint: "Edit the look and the content of the tooltip.",
            label: 'Tooltip editor',
            icon: "fas fa-edit",
            type: SettingsEditor,
            restricted: true,
        });
    }

    public getSettingsEditorOptions(): Array<any> {
        return [
            {
                key: this.settingKeys.DISPLAY_NAMES_IN_TOOLTIP,
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
                key: this.settingKeys.DARK_THEME,
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
                key: this.settingKeys.USE_ACCENT_COLOR_FOR_EVERYTHING,
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
                key: this.settingKeys.FONT_SIZE,
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
                key: this.settingKeys.ACCENT_COLOR,
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
    }
    
    public getSetting(key: string): any {
        return game?.settings?.get(Utils.moduleName, key);
    }

    public setSetting(key: string, data: any): Promise<any> {
        return game.settings.set(Utils.moduleName, key, data);
    }

    public registerSettings(): void {
        this._registerMenu();
        this._getSettings().forEach((setting) => {
            game?.settings?.register(Utils.moduleName, setting.key, setting.settings);
        });
    }

    public getSystemSpecificClass(): string {
        const systemId = game?.system?.id;
        return this._systemSpecificClasses.includes(systemId) ? systemId : 'default';
    }
}

export default Settings.getInstance();

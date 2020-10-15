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
                key: "tooltipVisibility",
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
                key: "tooltipPosition",
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
                key: "showAllOnAlt",
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
                key: "showTooltipForHiddenTokens",
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
                key: "debugOutput",
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
                key: "tooltipItems",
                settings: {
                    type: Object,
                    scope: "world",
                    restricted: true,
                    default: this._getSystemSpecificDefaults(),
                },
            },
            {
                key: "hostileItems",
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
                key: "displayNameInTooltip",
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
                key: "darkTheme",
                settings: {
                    name: "Dark theme --requires restart--",
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
                key: "useAccentColorForEverything",
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
                key: "fontSize",
                settings: {
                    name: "Font size --requires restart--",
                    hint: "Customize the fontsize used for the tooltip (e.g. 1.2rem | 15px).",
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
                key: "accentColor",
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

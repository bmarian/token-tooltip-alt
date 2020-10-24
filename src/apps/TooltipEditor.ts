import SettingsUtil from "../module/settings/SettingsUtil";
import {CONSTANTS} from "../module/enums/Constants";
import Utils from "../module/Utils";

export default class TooltipEditor extends FormApplication {
    static get defaultOptions(): any {
        return {
            ...super.defaultOptions,
            template: CONSTANTS.APPS.TOOLTIP_EDITOR,
            width: CONSTANTS.APPS.TOOLTIP_EDITOR_WIDTH,

            resizable: true,

            submitOnChange: false,
            closeOnSubmit: true,
            submitOnClose: false,
        };
    }

    // generate a default entry for GM items for a token disposition
    private _generateDefaultSettingsForDisposition(disposition): any {
        return {
            disposition,
            items: [],
        }
    }

    // create default static settings for
    // name - true for gm / the last tokenDisposition in the array
    // accentColor - #000000
    // use accent color for everything - false
    // token dispositions - always adding the latest one
    private _createDefaultStatics(staticSettings: any, isPlayer: boolean, tokenDispositions: Array<string>): void {
        const name = CONSTANTS.SETTING_KEYS.DISPLAY_NAMES_IN_TOOLTIP;
        const accentColor = CONSTANTS.SETTING_KEYS.ACCENT_COLOR;
        const useAccentEverywhere = CONSTANTS.SETTING_KEYS.USE_ACCENT_COLOR_FOR_EVERYTHING;
        const tokenDis = CONSTANTS.SETTING_KEYS.TOKEN_DISPOSITIONS;

        if (!(name in staticSettings)) staticSettings[name] = isPlayer ? tokenDispositions[tokenDispositions.length - 1] : true;
        if (!(accentColor in staticSettings)) staticSettings[accentColor] = '#000000';
        if (!(useAccentEverywhere in staticSettings)) staticSettings[useAccentEverywhere] = false;
        staticSettings[tokenDis] = tokenDispositions;
    }

    // check if no defaults are present for a disposition and creates them
    private _createDefaultSettings(entitySettings: Array<any>, tokenDispositions: Array<string>): void {
        let add;

        for (let i = 0; i < tokenDispositions.length; i++) {
            const tokenDisposition = tokenDispositions[i];
            add = true;

            for (let j = 0; j < entitySettings.length; j++) {
                const entitySetting = entitySettings[j];
                if (tokenDisposition === entitySetting.disposition) {
                    add = false;
                    break;
                }
            }

            if (add) entitySettings.push(this._generateDefaultSettingsForDisposition(tokenDisposition));
        }
    }

    // this is used in case a module or system plays with the dispositions, or if in
    // the future they will be changed
    private _removeDeprecatedSettings(entitySettings: Array<any>, tokenDispositions: Array<string>, returnArray: Array<any>): void {
        for (let i = 0; i < entitySettings.length; i++) {
            const entitySetting = entitySettings[i];

            if (entitySetting.removed || !tokenDispositions.includes(entitySetting.disposition)) entitySetting.removed = true;
            else returnArray.push(entitySetting);
        }
    }

    // handles the settings for the current actorType (getting the current settings if present, or creating
    // defaults if nothing is there)
    // reset: game.settings.set('token-tooltip-alt', 'gmSettings', {}); game.settings.set('token-tooltip-alt', 'playerSettings', {});
    private _getItemLists(): any {
        const returnGmItems = [];
        const returnPlayerItems = [];
        const actorType = this?.object?.actorType;
        const tokenDispositions = Object.keys(CONST?.TOKEN_DISPOSITIONS);

        const gmSettings = this._getSetting(CONSTANTS.SETTING_KEYS.GM_SETTINGS);
        const playerSettings = this._getSetting(CONSTANTS.SETTING_KEYS.PLAYER_SETTINGS);

        // get the settings for the current actorType
        const gmSettingsForType = gmSettings[actorType] || {};
        const playerSettingsForType = playerSettings[actorType] || {};

        // get the items
        const gmItems = gmSettingsForType.items || [];
        const playerItems = playerSettingsForType.items || [];

        // get the 'static' options (color, display name, etc)
        const gmStatic = gmSettingsForType.static || {};
        const playerStatic = playerSettingsForType.static || {};

        // verify/create the values for items
        this._createDefaultSettings(gmItems, tokenDispositions);
        this._createDefaultSettings(playerItems, tokenDispositions);
        this._removeDeprecatedSettings(gmItems, tokenDispositions, returnGmItems);
        this._removeDeprecatedSettings(playerItems, tokenDispositions, returnPlayerItems);

        // verify/create the values for static
        this._createDefaultStatics(gmStatic, false, tokenDispositions);
        this._createDefaultStatics(playerStatic, true, tokenDispositions);

        // set the new values
        gmSettingsForType.items = returnGmItems;
        playerSettingsForType.items = returnPlayerItems;
        gmSettingsForType.static = gmStatic;
        playerSettingsForType.static = playerStatic;
        gmSettings[actorType] = gmSettingsForType;
        playerSettings[actorType] = playerSettingsForType;

        this._setSetting(CONSTANTS.SETTING_KEYS.GM_SETTINGS, gmSettings);
        this._setSetting(CONSTANTS.SETTING_KEYS.PLAYER_SETTINGS, playerSettings);
        const returnSettings = {gmSettings: gmSettingsForType, playerSettings: playerSettingsForType};

        Utils.debug(returnSettings);
        return returnSettings;
    }

    // get a value from Settings
    private _getSetting(key: string): any {
        return SettingsUtil.getSetting(key);
    }

    // get a value from Settings
    private _setSetting(key: string, value: any): any {
        return SettingsUtil.setSetting(key, value);
    }

    // returns the data used by the tooltip-editor.hbs template
    public getData(options?: {}): any {
        const {gmSettings, playerSettings} = this._getItemLists();
        return {
            moduleName: Utils.moduleName,
            gmSettings,
            playerSettings,
        };
    }

    protected async _updateObject(event: Event | JQuery.Event, formData: any): Promise<any> {
        const expObj = expandObject(formData);

        Utils.debug(expObj);

    }

    public activateListeners($html: JQuery<HTMLElement>): void {
        super.activateListeners($html);
    }
}
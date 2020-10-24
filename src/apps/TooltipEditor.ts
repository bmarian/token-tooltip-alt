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
    private _getItemLists(): any {
        const returnGmItems = [];
        const returnPlayerItems = [];
        const actorType = this?.object?.actorType;

        const gmSettings = this._getSetting(CONSTANTS.SETTING_KEYS.GM_SETTINGS)[actorType] || [];
        const playerSettings = this._getSetting(CONSTANTS.SETTING_KEYS.PLAYER_SETTINGS)[actorType] || [];

        const tokenDispositions = Object.keys(CONST?.TOKEN_DISPOSITIONS);

        this._createDefaultSettings(gmSettings, tokenDispositions);
        this._createDefaultSettings(playerSettings, tokenDispositions);

        this._removeDeprecatedSettings(gmSettings, tokenDispositions, returnGmItems);
        this._removeDeprecatedSettings(playerSettings, tokenDispositions, returnPlayerItems);

        gmSettings[actorType] = returnGmItems;
        playerSettings[actorType] = returnPlayerItems;

        this._setSetting(CONSTANTS.SETTING_KEYS.GM_SETTINGS, gmSettings);
        this._setSetting(CONSTANTS.SETTING_KEYS.PLAYER_SETTINGS, playerSettings);

        return {gmSettings: returnGmItems, playerSettings: returnPlayerItems};
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
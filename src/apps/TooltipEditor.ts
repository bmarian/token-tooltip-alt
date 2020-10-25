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

    // returns the settings for the current actor type opened
    // and a boolean if it is the default type
    private _getSettingLists(): any {
        const type = this?.object?.actorType;
        const gmSettings = this._getSetting(CONSTANTS.SETTING_KEYS.GM_SETTINGS)[type] || {};
        const playerSettings = this._getSetting(CONSTANTS.SETTING_KEYS.PLAYER_SETTINGS)[type] || {};

        return {gmSettings, playerSettings, isDefault: type === CONSTANTS.APPS.TOOLTIP_DEFAULT_ACTOR_ID};
    }

    // get a value from Settings
    private _getSetting(key: string): any {
        return SettingsUtil.getSetting(key);
    }

    // get a value from Settings
    private async _setSetting(key: string, value: any): Promise<any> {
        return await SettingsUtil.setSetting(key, value);
    }

    // returns the data used by the tooltip-editor.hbs template
    public getData(options?: {}): any {
        const {gmSettings, playerSettings, isDefault} = this._getSettingLists();
        return {
            moduleName: Utils.moduleName,
            gmSettings,
            playerSettings,
            isDefault,
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
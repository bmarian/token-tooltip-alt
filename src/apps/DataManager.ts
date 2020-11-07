import SettingsUtil from "../module/settings/SettingsUtil";
import {CONSTANTS} from "../module/enums/Constants";
import Utils from "../module/Utils";
import TooltipEditor from "./TooltipEditor";

export default class DataManager extends FormApplication {
    static get defaultOptions(): any {
        return {
            ...super.defaultOptions,
            title: 'Data Manager',
            id: 'data-manager',
            template: CONSTANTS.APPS.DATA_MANAGER,
            width: CONSTANTS.APPS.TOOLTIP_MANAGER_WIDTH,
            height: CONSTANTS.APPS.DATA_MANAGER_HEIGHT,
            classes: [`${Utils.moduleName}-data-manager-window`],

            closeOnSubmit: true,
            submitOnClose: false,
        };
    }

    // get a value from Settings
    private _getSetting(key: string): any {
        return SettingsUtil.getSetting(key);
    }

    // get a value from Settings
    private async _setSetting(key: string, value: any): Promise<any> {
        return await SettingsUtil.setSetting(key, value);
    }

    // determines the type of data manager
    private _isImport(): boolean {
        return this?.object?.type === 'import';
    }

    private _exportData(): string {
        const gmSettings = this._getSetting(CONSTANTS.SETTING_KEYS.GM_SETTINGS);
        const playerSettings = this._getSetting(CONSTANTS.SETTING_KEYS.PLAYER_SETTINGS);

        const data = {gmSettings, playerSettings}
        return JSON.stringify(data);
    }

    // returns an empty string for import and the stringified data object if export
    private _getSettings(): string {
        return this._isImport() ? '' : this._exportData();
    }

    // returns the data used by the tooltip-manager.hbs template
    public async getData(options?: {}): Promise<any> {
        return {
            moduleName: Utils.moduleName,
            isImport: this._isImport(),
            settings: this._getSettings(),
        };
    }

    protected async _updateObject(event: Event | JQuery.Event, formData: any): Promise<any> {
        const stringData = formData['data'];
        try {
            const data = JSON.parse(stringData);
            const gmSettings = data.gmSettings;
            const playerSettings = data.playerSettings;

            if (!gmSettings || !playerSettings) return;
            await this._setSetting(CONSTANTS.SETTING_KEYS.GM_SETTINGS, gmSettings);
            await this._setSetting(CONSTANTS.SETTING_KEYS.PLAYER_SETTINGS, playerSettings);

            Utils.debug(data);
        } catch (err) {
            Utils.debug(`Error on importing: ${err}`);
        }
    }
}
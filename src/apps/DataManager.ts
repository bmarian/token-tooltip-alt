import SettingsUtil from "../module/settings/SettingsUtil";
import { CONSTANTS } from "../module/enums/Constants";
import Utils from "../module/Utils";

export default class DataManager extends FormApplication {
    private _advancedEditor = null;

    static get defaultOptions(): any {
        return {
            ...super.defaultOptions,
            title: 'Data Manager',
            id: 'data-manager',
            template: CONSTANTS.APPS.DATA_MANAGER,
            width: CONSTANTS.APPS.DATA_MANAGER_WIDTH,
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
        // @ts-ignore
        return this?.object?.type === 'import';
    }

    private _exportData(): string {
        const gmSettings = this._getSetting(CONSTANTS.SETTING_KEYS.GM_SETTINGS);
        const playerSettings = this._getSetting(CONSTANTS.SETTING_KEYS.PLAYER_SETTINGS);

        const data = { gmSettings, playerSettings }
        return JSON.stringify(data, null, 2);
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
        };
    }

    public _getSubmitData(...args) {
        if (this._advancedEditor) this._advancedEditor.save();
        // @ts-ignore
        return super._getSubmitData(...args);
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

    public activateListeners($html: JQuery): void {
        super.activateListeners($html);

        const $dataManager = $html.find('.data-manager');
        if (!$dataManager) return;

        const settings = this._getSettings();
        $dataManager.val(settings);

        // @ts-ignore
        this._advancedEditor = CodeMirror.fromTextArea($dataManager[0], {
            // @ts-ignore
            ...CodeMirror.userSettings,
            mode: 'javascript',
            inputStyle: 'contenteditable',

            lineNumbers: true,
            autofocus: this._isImport(),
            readOnly: !this._isImport()
        });
    }
}

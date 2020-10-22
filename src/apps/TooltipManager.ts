import SettingsUtil from "../module/settings/SettingsUtil";
import {CONSTANTS} from "../module/enums/Constants";
import Settings from "../module/settings/Settings";
import Utils from "../module/Utils";

export default class TooltipManager extends FormApplication {
    static get defaultOptions(): any {
        return {
            ...super.defaultOptions,
            title: 'Tooltip manager',
            template: CONSTANTS.APPS.TOOLTIP_MANAGER,
            width: CONSTANTS.APPS.MIN_WIDTH,
            submitOnChange: false,
            submitOnClose: false,

            closeOnSubmit: true,
            resizable: true,
        };
    }

    // get a value from Settings
    private _getSetting(key: string): any {
        return SettingsUtil.getSetting(key);
    }

    // get a value from Settings
    private _setSetting(key: string, value: any): any {
        return SettingsUtil.setSetting(key, value);
    }

    public getData(options?: {}): any {
        return {
            options: this.options,
            moduleName: Utils.moduleName,
        };
    }

    protected async _updateObject(event: Event | JQuery.Event, formData: any): Promise<any> {
    }

    public activateListeners($html: JQuery<HTMLElement>): void {
        super.activateListeners($html);
    }
}
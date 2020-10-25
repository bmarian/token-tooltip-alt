import Utils from "../module/Utils";
import {CONSTANTS} from "../module/enums/Constants";
import SettingsUtil from "../module/settings/SettingsUtil";
import Settings from "../module/settings/Settings";

export default class SettingsEditor extends FormApplication {
    static get defaultOptions(): any {
        return {
            ...super.defaultOptions,
            title: 'Tooltip Editor',
            template: `modules/${Utils.moduleName}/templates/settings-editor.hbs`,
            width: 700,
            submitOnChange: false,
            submitOnClose: true,
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

    private _prepareListsForDisplay(): {} {
        return {
            tooltipItems: this._getSetting(CONSTANTS.SETTING_KEYS.TOOLTIP_ITEMS) || [],
            hostileItems: this._getSetting(CONSTANTS.SETTING_KEYS.HOSTILE_ITEMS) || [],
        };
    }

    private _prepareSettingsEditorOptions(): Array<{}> {
        const settingsEditorOptions = [];
        for (let i = 0; i < settingsEditorOptions.length; i++) {
            const setting = settingsEditorOptions[i];
            const value = this._getSetting(setting.key);

            if (setting?.custom) setting.custom.value = value;
        }
        return settingsEditorOptions;
    }

    private _deleteClick(): void {
        $(this).closest(`.${Utils.moduleName}-row`).remove();
    }

    private async _addClick(bodyQuery: string, isFriendly: boolean, context: any): Promise<void> {
        const $tbody = $(context)?.parent()?.parent()?.find(bodyQuery);
        const $rows = $tbody.find(`.${Utils.moduleName}-row`);
        const lastIndex = $rows.length ? parseInt($rows.last().attr('index')) || 0 : 0;

        const data = {
            moduleName: Utils.moduleName,
            index: lastIndex + 1,
            isFriendly
        }
        const $newRow = $(await renderTemplate(CONSTANTS.TEMPLATES.SETTINGS_EDITOR_ROW, data));
        $tbody.append($newRow);

        // TODO: Make this... not so bad... maybe...
        // Future me here... this is not what I was talking about... but It's future future me problem now...
        $newRow.find(`.${Utils.moduleName}-row_button.delete${isFriendly ? '' : '_h'}`).on('click', () => {
            $tbody.find(`.${Utils.moduleName}-row[index=${lastIndex + 1}]`).remove();
        });
    }

    public getData(options?: {}): any {
        return {
            options: this.options,
            moduleName: Utils.moduleName,
            ...this._prepareListsForDisplay(),
            settingsEditorOptions: this._prepareSettingsEditorOptions(),
        };
    }

    private _buildSettingsArray(value: {}, icon: {}, expression: {}, isNumber: {}, color: {}, arr: Array<{}>): void {
        if (!(value && icon && expression)) return;

        for (let key in value) {
            if (!value.hasOwnProperty(key)) continue;
            const v = value[key];
            if (!v) continue;

            const i = icon[key];
            const e = expression[key];
            const n = isNumber[key];
            const c = color[key];
            arr.push({value: v, icon: i, expression: e, isNumber: n, color: c});
        }
    }

    public async _updateObject(event: Event | JQuery.Event, formData: any): Promise<any> {
        const expObj = expandObject(formData);

        const {value, icon, expression, isNumber, color} = expObj;
        const tooltipItems = [];
        this._buildSettingsArray(value, icon, expression, isNumber, color, tooltipItems);

        const {value_h, icon_h, expression_h, isNumber_h, color_h} = expObj;
        const hostileItems = [];
        this._buildSettingsArray(value_h, icon_h, expression_h, isNumber_h, color_h, hostileItems);

        const settings = expObj['token-tooltip-alt'];
        for (let key in settings) {
            if (!settings.hasOwnProperty(key)) continue;

            const v = settings[key];
            this._setSetting(key, v);
        }

        Utils.debug({tooltipItems, hostileItems});
        const ti = this._setSetting(CONSTANTS.SETTING_KEYS.TOOLTIP_ITEMS, tooltipItems);
        const hi = this._setSetting(CONSTANTS.SETTING_KEYS.HOSTILE_ITEMS, hostileItems);

        return {ti, hi};
    }

    public activateListeners($html: JQuery<HTMLElement>): void {
        super.activateListeners($html);
        const se = this;

        $html.find(`.${Utils.moduleName}-row_button.delete`).on('click', this._deleteClick);
        $html.find(`.${Utils.moduleName}-row_button.delete_h`).on('click', this._deleteClick);

        $html.find(`.${Utils.moduleName}-button.add`).on('click', (ev: any) => {
            return se._addClick(`.${Utils.moduleName}-friendly`, true, ev.target);
        });
        $html.find(`.${Utils.moduleName}-button.add_h`).on('click', (ev: any) => {
            return se._addClick(`.${Utils.moduleName}-hostile`, false, ev.target);
        });
    }
}
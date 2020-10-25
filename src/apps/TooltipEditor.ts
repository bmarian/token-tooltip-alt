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

    // get the table associated to a button (same disposition, same dType)
    private _getAssociatedTable($button: any, $context: any): any {
        const disposition = $button.attr('disposition');
        const dType = $button.attr('dType');
        const $table = $context.find(`.${Utils.moduleName}-table[disposition=${disposition}][dType=${dType}]`);
        return {disposition, dType, $table}
    }

    // the add button click event, adds a new line on the associated table
    private async _addButtonClickEvent(ev: any): Promise<void> {
        // because we take the button from ev.target, we need to make sure it's actually the button
        // and not the span or icon
        const $button = $(ev.target).closest('button');

        const $context = $button?.parent()?.parent(); // the parent form
        if (!$context.length) return;

        const {disposition, dType, $table} = this._getAssociatedTable($button, $context);
        const $tbody = $table.find('tbody');
        const $rows = $tbody.find(`.${Utils.moduleName}-row`);
        const lastIndex = $rows.length ? parseInt($rows.last().attr('index')) || 0 : 0;

        const data = {
            moduleName: Utils.moduleName,
            index: lastIndex + 1,
            disposition,
            type: dType,
            item: {
                color: '#000000',
            }
        }

        const $newRow = $(await renderTemplate(CONSTANTS.TEMPLATES.TOOLTIP_EDITOR_TABLE_ROW, data));
        $tbody.append($newRow)


    }

    public activateListeners($html: JQuery<HTMLElement>): void {
        super.activateListeners($html);
        $html.find(`.${Utils.moduleName}-button.add`).on('click', this._addButtonClickEvent.bind(this));
    }
}
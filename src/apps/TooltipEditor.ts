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
            closeOnSubmit: false,
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

        // Make this... not shit... maybe...
        // Future me here... this is not what I was talking about... but It's future future me problem now...
        // Future future me... I ended up just copy pasting this from the old settings
        $newRow.find(`.${Utils.moduleName}-row_button.delete`).on('click', () => {
            $tbody.find(`.${Utils.moduleName}-row[index=${lastIndex + 1}]`).remove();
        });
    }

    // the default delete event, just deletes the closest row
    private _deleteButtonClickEvent(): void {
        $(this).closest(`.${Utils.moduleName}-row`).remove();
    }

    // the default delete event, just deletes the closest row
    private async _importFromDefaultClickEvent(): Promise<void> {
        const type = this?.object?.actorType;
        const gmSettings = this._getSetting(CONSTANTS.SETTING_KEYS.GM_SETTINGS);
        const playerSettings = this._getSetting(CONSTANTS.SETTING_KEYS.PLAYER_SETTINGS);

        gmSettings[type] = gmSettings[CONSTANTS.SYSTEM_DEFAULT];
        playerSettings[type] = playerSettings[CONSTANTS.SYSTEM_DEFAULT];

        // save the new settings
        await this._setSetting(CONSTANTS.SETTING_KEYS.GM_SETTINGS, gmSettings);
        await this._setSetting(CONSTANTS.SETTING_KEYS.PLAYER_SETTINGS, playerSettings);

        // rerender the application to make it get the new data
        this.render();

        Utils.debug({gmSettings, playerSettings});
    }

    // clone the settings from the above table
    private _copyToClipboard(ev: any): void {
        const $button = $(ev.target).closest('button');
        const dType = $button.attr('dType');
        const disposition = $button.attr('disposition');

        // save the data first because we take it from the object in the backend
        this.render();
        const data = this._getSetting(dType === 'gm' ? CONSTANTS.SETTING_KEYS.GM_SETTINGS : CONSTANTS.SETTING_KEYS.PLAYER_SETTINGS);
        const settings = data[this?.object?.actorType];
        const items = settings.items;
        const from = items.find((i) => i.disposition === disposition);

        this._setSetting(CONSTANTS.SETTING_KEYS.CLIPBOARD, from?.items).then(() => Utils.debug(from?.items));
    }

    // clone the settings from the above table
    private async _pasteFromClipboard(ev: any): Promise<void> {
        const $button = $(ev.target).closest('button');
        const dType = $button.attr('dType');
        const disposition = $button.attr('disposition');

        const data = this._getSetting(dType === 'gm' ? CONSTANTS.SETTING_KEYS.GM_SETTINGS : CONSTANTS.SETTING_KEYS.PLAYER_SETTINGS);
        const settings = data[this?.object?.actorType];
        const items = settings.items;
        const to = items.find((i) => i.disposition === disposition);

        const clipboardData = this._getSetting(CONSTANTS.SETTING_KEYS.CLIPBOARD);
        if (!clipboardData || !clipboardData.length) return;

        to.items = clipboardData;

        await this._setSetting(dType === 'gm' ? CONSTANTS.SETTING_KEYS.GM_SETTINGS : CONSTANTS.SETTING_KEYS.PLAYER_SETTINGS, data);

        // render the form to save the new data
        this.render();

        Utils.debug({clipboardData});
    }

    // add button events for the ones generated when the application is opened
    public activateListeners($html: JQuery<HTMLElement>): void {
        super.activateListeners($html);
        $html.find(`.${Utils.moduleName}-button.add`).on('click', this._addButtonClickEvent.bind(this));
        $html.find(`.${Utils.moduleName}-row_button.delete`).on('click', this._deleteButtonClickEvent);
        $html.find(`.${Utils.moduleName}-footer_button.import`).on('click', this._importFromDefaultClickEvent.bind(this));
        $html.find(`.${Utils.moduleName}-button.copy`).on('click', this._copyToClipboard.bind(this));
        $html.find(`.${Utils.moduleName}-button.paste`).on('click', this._pasteFromClipboard.bind(this));
    }

    // make the final items array (the one inside the tokenType.items)
    private _extractItemsArray(items: any): any {
        const {value, icon, expression, isNumber, color} = items;
        if (!(value && icon && expression)) return [];

        const returnArray = [];
        for (let key in value) {
            if (!value.hasOwnProperty(key)) continue;
            const v = value[key];
            if (!v) continue;

            const i = icon[key];
            const e = expression[key];
            const n = isNumber[key];
            const c = color[key];
            returnArray.push({value: v, icon: i, expression: e, isNumber: n, color: c});
        }

        return returnArray;
    }

    // transform the items from the form into an array
    private _buildSettingsArray(items: any): any {
        const returnItems = [];
        for (let key in items) {
            if (!items.hasOwnProperty(key)) continue;

            const itemsForDisposition = items[key];
            returnItems.push({disposition: key, items: this._extractItemsArray(itemsForDisposition)});
        }

        return returnItems;
    }

    // generate a default entry for GM items for a token disposition
    private _generateDefaultSettingsForDisposition(disposition): any {
        return {
            disposition,
            items: [],
        }
    }

    // adds empty presets for the deleted dispositions
    private _persistEmptyPresets(items: any, dispositions: Array<string>): any {
        // we need this to keep everything in order, otherwise the empty ones will be last
        const returnItems = [];

        for (let i = 0; i < dispositions.length; i++) {
            const disposition = dispositions[i];

            let add = true;
            for (let j = 0; j < items.length; j++) {
                const item = items[j];
                if (item.disposition === disposition) {
                    returnItems.push(item);
                    add = false;
                    break;
                }
            }
            if (add) returnItems.push(this._generateDefaultSettingsForDisposition(disposition));
        }

        return returnItems;
    }

    protected async _updateObject(event: Event | JQuery.Event, formData: any): Promise<any> {
        const expObj = expandObject(formData);
        const type = this?.object?.actorType;
        const gmSettings = this._getSetting(CONSTANTS.SETTING_KEYS.GM_SETTINGS);
        const playerSettings = this._getSetting(CONSTANTS.SETTING_KEYS.PLAYER_SETTINGS);

        // build the items arrays
        const {gm, player} = expObj;
        const gmItems = this._buildSettingsArray(gm.items);
        const playerItems = this._buildSettingsArray(player.items);

        // re-add the tokenDispositions to the players static settings
        const tokenDispositions = Object.keys(CONST?.TOKEN_DISPOSITIONS)?.reverse();
        const tokenDis = CONSTANTS.SETTING_KEYS.TOKEN_DISPOSITIONS;
        const playerStatic = player.static;
        playerStatic[tokenDis] = tokenDispositions;

        const gmStatic = gm.static;
        gmStatic[tokenDis] = tokenDispositions;

        // update the settings
        gmSettings[type] = {
            items: this._persistEmptyPresets(gmItems, tokenDispositions),
            static: gmStatic,
        };
        playerSettings[type] = {
            items: this._persistEmptyPresets(playerItems, tokenDispositions),
            static: playerStatic,
        };

        // save the new settings
        await this._setSetting(CONSTANTS.SETTING_KEYS.GM_SETTINGS, gmSettings);
        await this._setSetting(CONSTANTS.SETTING_KEYS.PLAYER_SETTINGS, playerSettings);

        ui?.notifications?.info(`Settings updated for ${type}.`);
        Utils.debug({gmSettings, playerSettings});
    }
}
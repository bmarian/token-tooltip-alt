import { getSetting, setSettingSync } from '../TTAFoundryApiIntegration/Settings/TTASettingsUtils.js';
import { TTAConstants } from '../TTAConstants/TTAConstants.js';
import AdvancedEditor from './AdvancedEditor.js';
import {
  clone, debug, generateRandomColor, MODULE_NAME,
} from '../TTAUtils/TTAUtils.js';

export default class TooltipEditor extends FormApplication {
  static get defaultOptions() {
    return {
      ...super.defaultOptions,
      template: TTAConstants.APPS.TOOLTIP_EDITOR,
      width: TTAConstants.APPS.TOOLTIP_EDITOR_WIDTH,
      resizable: true,
      submitOnChange: false,
      closeOnSubmit: false,
      submitOnClose: false,
      tabs: [
        {
          contentSelector: 'form',
          navSelector: '.tabs',
          initial: 'gm',
        },
      ],
    };
  }

  // returns the settings for the current actor type opened
  // and a boolean if it is the default type
  _getSettingLists() {
    const type = this?.object?.actorType;
    const gmSettings = this._getSetting(TTAConstants.SETTING_KEYS.GM_SETTINGS)[type] || {};
    const playerSettings = this._getSetting(TTAConstants.SETTING_KEYS.PLAYER_SETTINGS)[type] || {};
    return { gmSettings, playerSettings, isDefault: type === TTAConstants.APPS.TOOLTIP_DEFAULT_ACTOR_ID };
  }

  // get a value from Settings
  _getSetting(key) {
    return getSetting(key);
  }

  // get a value from Settings
  async _setSetting(key, value) {
    return setSettingSync(key, value);
  }

  // returns the data used by the tooltip-editor.hbs template
  getData(options) {
    const { gmSettings, playerSettings, isDefault } = this._getSettingLists();
    return {
      moduleName: MODULE_NAME,
      gmSettings,
      playerSettings,
      isDefault,
    };
  }

  // get the table associated to a button (same disposition, same dType)
  _getAssociatedTable($button, $context) {
    const disposition = $button.attr('disposition');
    const dType = $button.attr('dType');
    const $table = $context.find(`.${MODULE_NAME}-table[disposition=${disposition}][dType=${dType}]`);
    return { disposition, dType, $table };
  }

  // the add button click event, adds a new line on the associated table
  async _addButtonClickEvent(ev) {
    // because we take the button from ev.target, we need to make sure it's actually the button
    // and not the span or icon
    const $button = $(ev.target).closest('button');
    const $context = $button?.parent()?.parent(); // the parent form
    if (!$context.length) { return; }
    const { disposition, dType, $table } = this._getAssociatedTable($button, $context);
    const $tbody = $table.find('tbody');
    const $rows = $tbody.find(`.${MODULE_NAME}-row`);
    const lastIndex = $rows.length ? parseInt($rows.last().attr('index'), 10) || 0 : 0;
    const data = {
      moduleName: MODULE_NAME,
      index: lastIndex + 1,
      disposition,
      type: dType,
      item: {
        color: generateRandomColor(),
      },
    };
    const $newRow = $(await renderTemplate(TTAConstants.TEMPLATES.TOOLTIP_EDITOR_TABLE_ROW, data));
    $tbody.append($newRow);
    // Make this... not shit... maybe...
    // Future me here... this is not what I was talking about... but It's future future me problem now...
    // Future future me... I ended up just copy pasting this from the old settings
    $newRow.find(`.${MODULE_NAME}-row_button.delete`).on('click', () => {
      $tbody.find(`.${MODULE_NAME}-row[index=${lastIndex + 1}]`).remove();
    });
    $newRow.find(`.${MODULE_NAME}-row_button.advanced-editor`).on('click', this._openAdvancedEditor);
  }

  // the default delete event, just deletes the closest row
  _deleteButtonClickEvent() {
    $(this).closest(`.${MODULE_NAME}-row`).remove();
  }

  // opens the advanced editor
  _openAdvancedEditor() {
    const $this = $(this);
    const target = $this.parent().find('textarea');
    if (!target) { return; }
    const te = new AdvancedEditor({ target });
    te.render(true);
    debug(`Opened an advanced editor for: ${target.attr('name')}.`);
  }

  // the default delete event, just deletes the closest row
  async _importFromDefaultClickEvent() {
    const type = this?.object?.actorType;
    const gmSettings = this._getSetting(TTAConstants.SETTING_KEYS.GM_SETTINGS);
    const playerSettings = this._getSetting(TTAConstants.SETTING_KEYS.PLAYER_SETTINGS);
    gmSettings[type] = gmSettings[TTAConstants.SYSTEM_DEFAULT];
    playerSettings[type] = playerSettings[TTAConstants.SYSTEM_DEFAULT];
    // save the new settings
    await this._setSetting(TTAConstants.SETTING_KEYS.GM_SETTINGS, gmSettings);
    await this._setSetting(TTAConstants.SETTING_KEYS.PLAYER_SETTINGS, playerSettings);
    // rerender the application to make it get the new data
    this.render();
    debug({ gmSettings, playerSettings });
  }

  // clone the settings from the above table
  _copyToClipboard(ev) {
    const $button = $(ev.target).closest('button');
    const dType = $button.attr('dType');
    const disposition = $button.attr('disposition');
    // save the data first because we take it from the object in the backend
    this.submit({}).then(() => {
      const data = this._getSetting(dType === 'gm' ? TTAConstants.SETTING_KEYS.GM_SETTINGS : TTAConstants.SETTING_KEYS.PLAYER_SETTINGS);
      const settings = data[this?.object?.actorType];
      const { items } = settings;
      const from = items.find((i) => i.disposition === disposition);
      this._setSetting(TTAConstants.SETTING_KEYS.CLIPBOARD, from?.items).then(() => debug(from?.items));
    });
  }

  // clone the settings from the above table
  async _pasteFromClipboard(ev) {
    const $button = $(ev.target).closest('button');
    const dType = $button.attr('dType');
    const disposition = $button.attr('disposition');
    const data = this._getSetting(dType === 'gm' ? TTAConstants.SETTING_KEYS.GM_SETTINGS : TTAConstants.SETTING_KEYS.PLAYER_SETTINGS);
    const settings = data[this?.object?.actorType];
    const { items } = settings;
    const to = items.find((i) => i.disposition === disposition);
    const clipboardData = this._getSetting(TTAConstants.SETTING_KEYS.CLIPBOARD);
    if (!clipboardData || !clipboardData.length) { return; }
    to.items = clipboardData;
    await this._setSetting(dType === 'gm' ? TTAConstants.SETTING_KEYS.GM_SETTINGS : TTAConstants.SETTING_KEYS.PLAYER_SETTINGS, data);
    // render the form to save the new data
    this.render();
    debug({ clipboardData });
  }

  // add button events for the ones generated when the application is opened
  activateListeners($html) {
    super.activateListeners($html);
    // sortable end event, we need to redraw the table inputs
    const dragOverHandler = (tbody) => () => {
      $(tbody).find('tr').each((index, tr) => {
        const $tr = $(tr);
        $tr.attr('index', index);
        $tr.find('input').each((_0, input) => {
          const $input = $(input);
          const name = $input.attr('name');
          const newName = name.substr(0, name.lastIndexOf('.') + 1) + index;
          $input.attr('name', newName);
        });
        $tr.find('textarea').each((_0, textarea) => {
          const $textarea = $(textarea);
          const name = $textarea.attr('name');
          const newName = name.substr(0, name.lastIndexOf('.') + 1) + index;
          $textarea.attr('name', newName);
        });
      });
    };
    // add sortable handlers
    $html.find(`.${MODULE_NAME}-table tbody`).each((index, tbody) => {
      const dragOverHandlerWithBody = dragOverHandler(tbody);
      new Sortable(tbody, {
        scroll: true,
        handle: `.${MODULE_NAME}-sort-handler`,
        draggable: `.${MODULE_NAME}-row`,
        animation: 150,
        onEnd: dragOverHandlerWithBody,
      });
    });
    $html.find(`.${MODULE_NAME}-button.add`).on('click', this._addButtonClickEvent.bind(this));
    $html.find(`.${MODULE_NAME}-row_button.delete`).on('click', this._deleteButtonClickEvent);
    $html.find(`.${MODULE_NAME}-row_button.advanced-editor`).on('click', this._openAdvancedEditor);
    $html.find(`.${MODULE_NAME}-footer_button.import`).on('click', this._importFromDefaultClickEvent.bind(this));
    $html.find(`.${MODULE_NAME}-button.copy`).on('click', this._copyToClipboard.bind(this));
    $html.find(`.${MODULE_NAME}-button.paste`).on('click', this._pasteFromClipboard.bind(this));
    const settingsList = this._getSettingLists();
    $html.find(`.${MODULE_NAME}-row_tracked-value textarea`).each((_0, textarea) => {
      const $textarea = $(textarea);
      const [type, _1, disposition, _2, index] = $textarea.attr('name').split('.'); // e.g. gm.items.HOSTILE.value.0
      const settings = type === 'gm' ? settingsList.gmSettings : settingsList.playerSettings;
      const value = settings.items.find((i) => i.disposition === disposition).items[index]?.value;
      $textarea.val(value);
    });
  }

  // make the final items array (the one inside the tokenType.items)
  _extractItemsArray(items) {
    const {
      value, icon, isFunction, expression, isNumber, color,
    } = items;
    if (!(value && icon && expression)) { return []; }
    const returnArray = [];
    for (const key in value) {
      if (!value.hasOwnProperty(key)) { continue; }
      const v = value[key];
      if (!v) { continue; }
      const i = icon[key];
      const f = isFunction[key];
      const e = expression[key];
      const n = isNumber[key];
      const c = color[key];
      returnArray.push({
        value: v, icon: i, isFunction: f, expression: e, isNumber: n, color: c,
      });
    }
    return returnArray;
  }

  // transform the items from the form into an array
  _buildSettingsArray(items) {
    const returnItems = [];
    for (const key in items) {
      if (!items.hasOwnProperty(key)) { continue; }
      const itemsForDisposition = items[key];
      returnItems.push({ disposition: key, items: this._extractItemsArray(itemsForDisposition) });
    }
    return returnItems;
  }

  // generate a default entry for GM items for a token disposition
  _generateDefaultSettingsForDisposition(disposition) {
    return {
      disposition,
      items: [],
    };
  }

  // adds empty presets for the deleted dispositions
  _persistEmptyPresets(items, dispositions) {
    // we need this to keep everything in order, otherwise the empty ones will be last
    const returnItems = [];
    for (let i = 0; i < dispositions.length; i += 1) {
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
      if (add) { returnItems.push(this._generateDefaultSettingsForDisposition(disposition)); }
    }
    return returnItems;
  }

  async _updateObject(event, formData) {
    const expObj = expandObject(formData);
    const type = this?.object?.actorType;
    const gmSettings = this._getSetting(TTAConstants.SETTING_KEYS.GM_SETTINGS);
    const playerSettings = this._getSetting(TTAConstants.SETTING_KEYS.PLAYER_SETTINGS);
    // build the items arrays
    const { gm, player } = expObj;
    const gmItems = this._buildSettingsArray(gm.items);
    const playerItems = this._buildSettingsArray(player.items);
    // re-add the tokenDispositions to the players static settings
    const tokenDispositions = Object.keys(CONST?.TOKEN_DISPOSITIONS)?.reverse();
    const gmDispositions = clone(tokenDispositions);
    const playerDispositions = [TTAConstants.APPS.OWNED_DISPOSITION, ...clone(tokenDispositions)];
    const tokenDis = TTAConstants.SETTING_KEYS.TOKEN_DISPOSITIONS;
    const playerStatic = player.static;
    playerStatic[tokenDis] = gmDispositions;
    const gmStatic = gm.static;
    gmStatic[tokenDis] = playerDispositions;
    // update the settings
    gmSettings[type] = {
      items: this._persistEmptyPresets(gmItems, gmDispositions),
      static: gmStatic,
    };
    playerSettings[type] = {
      items: this._persistEmptyPresets(playerItems, playerDispositions),
      static: playerStatic,
    };
    // save the new settings
    await this._setSetting(TTAConstants.SETTING_KEYS.GM_SETTINGS, gmSettings);
    await this._setSetting(TTAConstants.SETTING_KEYS.PLAYER_SETTINGS, playerSettings);
    ui?.notifications?.info(`Settings updated for ${type}.`);
    debug({ gmSettings, playerSettings });
  }
}

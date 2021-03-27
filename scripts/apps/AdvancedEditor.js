import { CONSTANTS } from '../enums/Constants.js';
import Utils from '../Utils.js';

export default class AdvancedEditor extends FormApplication {
  constructor() {
    super(...arguments);
    this._advancedEditor = null;
  }

  static get defaultOptions() {
    return {
      ...super.defaultOptions,
      title: 'Advanced editor',
      template: CONSTANTS.APPS.ADVANCED_EDITOR,
      width: CONSTANTS.APPS.ADVANCED_EDITOR_WIDTH,
      height: CONSTANTS.APPS.ADVANCED_EDITOR_HEIGHT,
      classes: [`${Utils.moduleName}-advanced-editor-window`],
      resizable: true,
      closeOnSubmit: true,
      submitOnClose: true,
    };
  }

  /**
     * Returns the targeted textarea from TooltipEditor
     *
     * @return {JQuery} the targeted textarea from TooltipEditor
     * @private
     */
  _getTarget() {
    // @ts-ignore
    return this?.object?.target;
  }

  async getData(options) {
    return {
      moduleName: Utils.moduleName,
      value: this._getTarget()?.val(),
    };
  }

  _getSubmitData(...args) {
    if (this._advancedEditor) { this._advancedEditor.save(); }
    // @ts-ignore
    return super._getSubmitData(...args);
  }

  async _updateObject(event, formData) {
    const stringData = formData.value;
    this._getTarget()?.val(stringData);
    Utils.debug(`Updated ${this._getTarget()?.attr('name')}, with:\n${stringData}`);
  }

  activateListeners($html) {
    super.activateListeners($html);
    const $advancedEditor = $html.find('.advanced-editor');
    if (!$advancedEditor) { return; }
    $advancedEditor.val(this._getTarget()?.val());
    // @ts-ignore
    this._advancedEditor = CodeMirror.fromTextArea($advancedEditor[0], {
      // @ts-ignore
      ...CodeMirror.userSettings,
      mode: 'javascript',
      inputStyle: 'contenteditable',
      lineNumbers: true,
      autofocus: true,
    });
  }
}

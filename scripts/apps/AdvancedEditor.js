import { TTAConstants } from '../TTAConstants/TTAConstants.js';
import { debug, MODULE_NAME } from '../TTAUtils/TTAUtils.js';

export default class AdvancedEditor extends FormApplication {
  constructor() {
    super(...arguments);
    this._advancedEditor = null;
  }

  static get defaultOptions() {
    return {
      ...super.defaultOptions,
      title: 'Advanced editor',
      template: TTAConstants.APPS.ADVANCED_EDITOR,
      width: TTAConstants.APPS.ADVANCED_EDITOR_WIDTH,
      height: TTAConstants.APPS.ADVANCED_EDITOR_HEIGHT,
      classes: [`${MODULE_NAME}-advanced-editor-window`],
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
    return this?.object?.target;
  }

  // eslint-disable-next-line no-unused-vars
  async getData(options) {
    return {
      moduleName: MODULE_NAME,
      value: this._getTarget()?.val(),
    };
  }

  _getSubmitData(...args) {
    if (this._advancedEditor) { this._advancedEditor.save(); }
    return super._getSubmitData(...args);
  }

  async _updateObject(event, formData) {
    const stringData = formData.value;
    this._getTarget()?.val(stringData);
    debug(`Updated ${this._getTarget()?.attr('name')}, with:\n${stringData}`);
  }

  activateListeners($html) {
    super.activateListeners($html);
    const $advancedEditor = $html.find('.advanced-editor');
    if (!$advancedEditor) { return; }
    $advancedEditor.val(this._getTarget()?.val());
    this._advancedEditor = CodeMirror.fromTextArea($advancedEditor[0], {
      ...CodeMirror.userSettings,
      mode: 'javascript',
      inputStyle: 'contenteditable',
      lineNumbers: true,
      autofocus: true,
    });
  }
}

import {CONSTANTS} from "../module/enums/Constants";
import Utils from "../module/Utils";

export default class AdvancedEditor extends FormApplication {
    private _advancedEditor = null;

    static get defaultOptions(): any {
        return {
            ...super.defaultOptions,
            title: 'Advanced editor',
            template: CONSTANTS.APPS.ADVANCED_EDITOR,
            width: CONSTANTS.APPS.ADVANCED_EDITOR_WIDTH,
            height: CONSTANTS.APPS.ADVANCED_EDITOR_HEIGHT,
            classes: [`${Utils.moduleName}-advanced-editor-window`],

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
    private _getTarget() {
        return this?.object?.target;
    }

    public async getData(options?: {}): Promise<any> {
        return {
            moduleName: Utils.moduleName,
            value: this._getTarget()?.val(),
        };
    }

    public _getSubmitData(...args) {
        if (this._advancedEditor) this._advancedEditor.save();

        // @ts-ignore
        return super._getSubmitData(...args);
    }

    protected async _updateObject(event: Event | JQuery.Event, formData: any): Promise<any> {
        const stringData = formData['value'];
        this._getTarget()?.val(stringData);

        Utils.debug(`Updated ${this._getTarget()?.attr('name')}, with:\n${stringData}`);
    }

    public activateListeners($html: JQuery): void {
        super.activateListeners($html);

        const $advancedEditor = $html.find('.advanced-editor');
        if (!$advancedEditor) return;

        $advancedEditor.val(this._getTarget()?.val());
        // @ts-ignore
        this._advancedEditor = CodeMirror.fromTextArea($advancedEditor[0], {
            mode: 'javascript',
            inputStyle: 'contenteditable',

            lineNumbers: true,
            smartIndent: true,
            autofocus: true
        });
    }
}
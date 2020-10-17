import Utils from "./Utils";
import Settings from "./Settings";
import stringMath from "../lib/MathEngine";

class Tooltip {
    private _tooltipTypes = {FULL: 'full', PARTIAL: 'partial', NONE: 'none'};
    private _reg = {
        // searches if the string is one path
        path: new RegExp(/^([\w_-]+\.)*([\w_-]+)$/),
        // searches for all the paths in a string
        paths: new RegExp(/([\w_-]+\.)*([\w_-]+)/g),
        // determines if the string is a number
        number: new RegExp(/\d+/),
        // searches for all the paths inside {}
        expressions: new RegExp(/{([^}]*)}/g),
        // determines if the string is a -
        minus: new RegExp(/-/),
    }
    private _tooltip = null;
    private _doStringMath = stringMath;

    private readonly _token;
    private readonly _data;
    private readonly _themeClass;
    private readonly _systemClass;
    private readonly _fontSize;
    private readonly _where;
    private readonly _animType;
    private readonly _animSpeed;
    private readonly _gameBody;
    private readonly _visibility;
    private readonly _template;
    private readonly _accentColor;
    private readonly _settingsKeys;
    private readonly _exception;
    private readonly _moduleName;

    constructor(
        token: any,
        themeClass: string,
        systemClass: string,
        fontSize: string,
        where: string,
        animType: string,
        animSpeed: number,
        path: string,
        visibility: string,
        template: string,
        gameBody: JQuery
    ) {
        this._token = token;
        this._themeClass = themeClass;
        this._systemClass = systemClass;
        this._fontSize = fontSize;
        this._where = where;
        this._animType = animType;
        this._animSpeed = animSpeed;
        this._visibility = visibility;
        this._template = template;

        this._gameBody = gameBody;
        this._moduleName = Utils.moduleName;
        this._data = this._getNestedData(this._token, path);

        this._settingsKeys = Settings.settingKeys;
        this._accentColor = this._getSetting(this._settingsKeys.USE_ACCENT_COLOR_FOR_EVERYTHING) ? this._getSetting(this._settingsKeys.ACCENT_COLOR) : null;
        this._exception = this._getSetting(this._settingsKeys.DONT_SHOW);
    }

    // get a value from Settings
    private _getSetting(setting: string): any {
        return Settings.getSetting(setting);
    }

    // extracts data from an object, and a string path,
    // it has no depth search limit
    private _getNestedData(data: any, path: string): any {
        if (!this._reg.path.test(path)) return null;

        const paths = path.split('.');
        if (!paths.length) return null;

        let res = data;
        for (let i = 0; i < paths.length; i++) {
            if (res === undefined) return null;
            res = res?.[paths[i]];
        }
        return res;
    }

    // converts a string to a number if possible
    private _extractNumber(value: string): any {
        const parsedValue = parseFloat(value);
        return isNaN(parsedValue) ? null : parsedValue;
    }

    // extracts data from an operation
    private _getOperationData(data: any, operation: string): any {
        const t = this;
        const convOp = operation.replace(this._reg.paths, (dataPath: string) => {
            if (t._reg.number.test(dataPath) || t._reg.minus.test(dataPath)) return dataPath;
            return t._extractNumber(t._getNestedData(this._data, dataPath));
        });
        return this._doStringMath(convOp);
    }

    // determines how operations are processed: if is needed to _getNestedData or to _getOperationData
    private _expressionHandler(data: any, expression: string): any {
        const t = this;
        let hasNull = false;
        const convExp = expression.replace(this._reg.expressions, (_0: string, dataPath: string) => {
            const value = t[t._reg.path.test(dataPath) ? '_getNestedData' : '_getOperationData'](data, dataPath);

            // The explicit check is needed for values that have 0;
            if (value === null) {
                hasNull = true;
                return '';
            }

            return value;
        });

        return hasNull ? null : convExp;
    }

    // determines what type of tooltip should be shown
    // * if the user is a gm -> FULL
    // * if visibility = owned
    //   ** user is the owner of the token -> FULL
    // * if visibility = friendly
    //   ** the token is friendly || user can observe the token -> FULL
    // * if visibility = all
    //   ** the token is hostile -> PARTIAL
    private _tooltipType(): string {
        if (game?.user?.isGM) return this._tooltipTypes.FULL;
        if (this._visibility === 'gm') return this._tooltipTypes.NONE;
        if (this._token?.actor?.owner) return this._tooltipTypes.FULL;

        const isFriendly = this._token?.data?.disposition === CONST?.TOKEN_DISPOSITIONS?.FRIENDLY;
        const isObservable = this._token?.actor?.permission === CONST?.ENTITY_PERMISSIONS?.OBSERVER;

        if ((isFriendly || isObservable) && (this._visibility === 'friendly' || this._visibility === 'all')) return this._tooltipTypes.FULL;
        if (this._visibility === 'all') return this._tooltipTypes.PARTIAL;
    }

    // appends to a stats array a structure for stats
    private _appendStat(item: any, value: any, stats: Array<any>): void {
        if (!(item && value && stats)) return;
        // TODO
    }

    // generates an array of stats that should be displayed
    private _getTooltipData(tooltipType: string): any {
        const stats = [];
        const isTypeFull = tooltipType === this._tooltipTypes.FULL;

        const itemList = this._getSetting(isTypeFull ? this._settingsKeys.TOOLTIP_ITEMS : this._settingsKeys.HOSTILE_ITEMS);

        for (let i = 0; i < itemList.length; i++) {
            const item = itemList[i];
            const value = this[item?.expression ? '_expressionHandler' : '_getNestedData'](this._data, item.value);

            if (this._exception !== '' && value?.toString() === this._exception) return {stats: []};
            if (this._accentColor) item.color = this._accentColor;

            this._appendStat(item, value, stats);
        }

        const tokenName = this._getSetting(this._settingsKeys.DISPLAY_NAMES_IN_TOOLTIP) ? this._token?.data?.name : null;

        if (isTypeFull) Utils.debug({tokenName, data: this._data});

        return {moduleName: this._moduleName, stats, tokenName};
    }

    // determines what should be shown in the tooltip
    private async _buildTooltipContent(): Promise<HTMLElement> {
        const type = this._tooltipType();
        if (type === this._tooltipTypes.NONE) return null;

        const data = this._getTooltipData(type);
        if (!data.stats.length) return null;

        return await renderTemplate(this._template, data);
    }

    // populates the tooltip container with the build content, and returns if the tooltip has content
    // should only be called by _createTooltip()
    private _populateContainer(): boolean {
        const content = this._buildTooltipContent();
        if (!content) this._tooltip.html(content);

        return !!content;
    }

    // creates the tooltip's container
    // should only be called by _createTooltip()
    private _createContainer(): void {
        this._tooltip = $(`<div class="${this._moduleName}-tooltip-container ${this._systemClass} ${this._themeClass}"></div>`);
        this._tooltip.css({fontSize: this._fontSize});
    }

    // appends the tooltip's container to the body
    // should only be called by _createTooltip()
    private _appendContainerToBody(): void {
        this._gameBody.append(this._tooltip);
    }

    // creates a tooltip, and only displays it if it has content
    private _createTooltip(): void {
        this._createContainer();
        const hasContent = this._populateContainer();

        if (hasContent) this._appendContainerToBody();
    }

    // will first remove the tooltip from the DOM, then make the reference null
    private _destroyTooltip(): void {
        this._tooltip.remove();
        this._tooltip = null;
    }

    // the name is a bit misleading, this will attempt to create the tooltip,
    // then play an animation to show it
    public show(): void {
        this._createTooltip();

        switch (this._animType) {
            case 'fade': {
                this._tooltip.css({opacity: 0});
                this._tooltip.animate({opacity: 1}, this._animSpeed);
                break;
            }
        }
    }

    // the name is a bit misleading, this will attempt to play an animation,
    // then destroy the tooltip
    public hide(): void {
        switch (this._animType) {
            case 'none': {
                this._destroyTooltip();
                break;
            }
            case 'fade': {
                this._tooltip.animate({opacity: 0}, this._animSpeed, this._destroyTooltip);
                break;
            }
        }
    }
}

export default Tooltip;
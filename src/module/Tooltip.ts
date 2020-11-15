import Utils from "./Utils";
import {doMath} from "../lib/MathEngine";
import {CONSTANTS} from "./enums/Constants";
import SettingsUtil from "./settings/SettingsUtil";

class Tooltip {
    private _reg = {
        // searches if the string is one path
        path: new RegExp(/^([\w_-]+\.)*([\w_-]+)$/),
        // searches for all the paths in a string
        paths: new RegExp(/<([\w_-]+\.)*([\w_-]+)>/g),
        // determines if the string is a number
        number: new RegExp(/\d+/),
        // searches for all the paths inside {}
        expressions: new RegExp(/{([^}]*)}/g),
        // determines if the string is a -
        minus: new RegExp(/-/),
        // check if its a font awesome icon
        faIcon: new RegExp(/^[\w\-]+$/),
    }
    private _tooltip = null;
    private _doStringMath = doMath;
    private _accentColor = '#000000';

    private readonly _token;
    private readonly _data;
    private readonly _themeClass;
    private readonly _systemClass;
    private readonly _fontSize;
    private readonly _where;
    private readonly _animType;
    private readonly _animSpeed;
    private readonly _gameBody;
    private readonly _template;
    private readonly _settingsKeys;
    private readonly _appKeys;
    private readonly _moduleName;
    private readonly _tooltipInfo;
    private readonly _maxRows;

    constructor(
        token?: any,
        themeClass?: string,
        systemClass?: string,
        fontSize?: string,
        where?: string,
        animType?: string,
        animSpeed?: number,
        path?: string,
        template?: string,
        gameBody?: JQuery,
        tooltipInfo?: any,
    ) {
        this._token = token;
        this._themeClass = themeClass;
        this._systemClass = systemClass;
        this._fontSize = fontSize;
        this._where = where;
        this._animType = animType;
        this._animSpeed = animSpeed;
        this._template = template;
        this._tooltipInfo = tooltipInfo;

        this._gameBody = gameBody;
        this._moduleName = Utils.moduleName;
        this._data = path === '' ? token : this._getNestedData(this._token, path);

        this._settingsKeys = CONSTANTS.SETTING_KEYS;
        this._appKeys = CONSTANTS.APPS;

        this._maxRows = this._getSetting(this._settingsKeys.MAX_ROWS) || 5;
    }

    // get a value from Settings
    private _getSetting(key: string): any {
        return SettingsUtil.getSetting(key);
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
            const dp = dataPath.substring(1, dataPath.length - 1);
            if (t._reg.number.test(dp) || t._reg.minus.test(dp)) return dp;
            return t._getNestedData(this._data, dp);
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

            if (typeof value === 'object') {
                const entries = value?.entries;
                return entries && entries.reduce((e, v) => e + v + ' ', '')?.slice(0, -1);
            }

            return value;
        });

        return hasNull ? null : convExp;
    }

    // checks what type of icon it is:
    // * font awesome icon
    // * url
    private _getIconData(icon: string): {} {
        return {icon, iconType: icon ? this._reg.faIcon.test(icon.trim()) : true, iconSize: this._fontSize};
    }

    // appends stats with only a value
    private _appendSimpleStat(value: any, item: any, stats: Array<any>): void {
        if (value === '' || (typeof value !== 'string' && isNaN(value))) return;
        const v = item.isNumber ? this._extractNumber(value) : value;
        stats.push({value: v, color: item?.color, ...this._getIconData(item?.icon)});
    }

    // appends object stats (they need to have a fixed structure)
    // {value, max} and optional {temp, tempmax}
    private _appendObjectStat(values: any, item: any, stats: Array<any>): void {
        if (isNaN(values.value) || isNaN(values.max) || values.value === null || values.max === null) return;

        const temp = values.temp > 0 ? `(${values.temp})` : '';
        const tempmax = values.tempmax > 0 ? `(${values.tempmax})` : '';
        const value = `${values.value}${temp}/${values.max}${tempmax}`;
        stats.push({value, color: item?.color, ...this._getIconData(item?.icon)});
    }

    // appends to a stats array a structure for stats
    private _appendStat(item: any, value: any, stats: Array<any>): void {
        if (!(item && value !== null && stats)) return;

        if (typeof value === 'object') {
            this._appendObjectStat(
                {
                    value: this._extractNumber(value.value),
                    max: this._extractNumber(value.max),
                    temp: this._extractNumber(value.temp),
                    tempmax: this._extractNumber(value.tempmax),
                },
                item,
                stats
            );
        } else {
            this._appendSimpleStat(value, item, stats);
        }
    }

    // determines if for this type of actor there is custom data, or the default should be used
    private _getActorData(): any {
        const defaultType = this._appKeys.TOOLTIP_DEFAULT_ACTOR_ID;
        const actors = this._getSetting(this._settingsKeys.ACTORS);
        if (!actors.length) return {};

        // determine the actor we are working with
        let actor = null;
        for (let i = 0; i < actors.length; i++) {
            const a = actors[i];
            if (a.id === this._tooltipInfo.actorType) {
                actor = a;
                break;
            }
        }
        if (!actor) return {};

        // determines if we should get the data from the gms settings or from players
        const settings = this._getSetting(this._tooltipInfo.isGM ? this._settingsKeys.GM_SETTINGS : this._settingsKeys.PLAYER_SETTINGS);
        // if the actor has custom data we try to get that, if not we use the default
        return settings?.[actor.custom ? this._tooltipInfo.actorType : defaultType] || {};
    }

    // get the current actor disposition as a string (foundry has it as an enum e.g. 0 -> NEUTRAL)
    private _getActorDisposition(tokenDispositions: Array<string>): string {
        const dispositionsWithoutOwned = tokenDispositions.filter(d => d !== this._appKeys.OWNED_DISPOSITION);
        const disposition = dispositionsWithoutOwned?.[parseInt(this._token?.data?.disposition) + 1];

        if (this._tooltipInfo.isGM) return disposition;

        return this._token?.actor?.permission >= CONST?.ENTITY_PERMISSIONS?.OBSERVER ? this._appKeys.OWNED_DISPOSITION : disposition;
    }

    // This returns the itemList for a given disposition
    private _getItemListForDisposition(items: any, disposition: string) {
        for (let i = 0; i < items?.length; i++) {
            const item = items[i];
            if (item.disposition === disposition) return item.items;
        }
        return [];
    }

    // Determines if the tooltip should have the name shown, for the GM this is a simple yes or no answer
    // for players this gets a little bit complicated
    private _getActorDisplayName(staticData: any): string {
        if (!staticData) return null;

        const tokenName = this._token?.data?.name;
        if (this._tooltipInfo.isGM && staticData.displayNameInTooltip) return tokenName;

        if (!this._tooltipInfo.isGM) {
            // here I do some logic that I don't really like but I can't find a good way of doing it
            const tokenDisposition = parseInt(this._token?.data?.disposition) + 1; // adding a +1 because the numbers start from -1 (hostile)
            const index = staticData?.tokenDispositions?.indexOf(staticData.displayNameInTooltip);

            // Fix for NONE and OWNED
            if (index === -1) {
                if (staticData.displayNameInTooltip === this._appKeys.NONE_DISPOSITION) return null;
                return staticData.displayNameInTooltip === this._appKeys.OWNED_DISPOSITION
                && this._token?.actor?.permission >= CONST?.ENTITY_PERMISSIONS?.OBSERVER ? tokenName : null;
            }

            // Example: ['HOSTILE', 'NEUTRAL', 'FRIENDLY'] <=> [-1, 0, 1]
            // tokenDisposition = -1 + 1 (0) <=> HOSTILE
            // index = indexOf('FRIENDLY') <=> 2
            // In this case we don't want to show the name so: index > tokenDisposition => NO NAME
            if (index <= tokenDisposition) return tokenName;
        }

        return null;
    }

    // generates an array of stats that should be displayed
    private _getTooltipData(): any {
        const data = this._getActorData();
        if (!data) return {stats: []};

        const stats = [];
        const staticData = {
            ...data.static,
            // This is needed to not modify the original object, and also to reverse it only once here
            tokenDispositions: data?.static?.tokenDispositions ? Utils.clone(data?.static?.tokenDispositions)?.reverse() : [],
        };
        const itemList = this._getItemListForDisposition(data.items, this._getActorDisposition(staticData?.tokenDispositions));

        if (!staticData || !itemList.length) return {stats: []};

        for (let i = 0; i < itemList.length; i++) {
            const item = itemList[i];
            const value = this[item?.expression ? '_expressionHandler' : '_getNestedData'](this._data, item.value);

            if (staticData.useAccentEverywhere) item.color = staticData.accentColor;

            this._appendStat(item, value, stats);
        }

        const tokenName = this._getActorDisplayName(staticData);

        // FIXME: this should not be here I think, but I am sleep deprived and running on beer so what do I know
        this._accentColor = staticData.accentColor;

        Utils.debug({tokenName, data: this._data});
        return {moduleName: this._moduleName, stats, tokenName};
    }

    // break the rows into columns
    private _breakInColumns(stats: Array<any>): Array<Array<any>> {
        if (stats.length <= this._maxRows) return [stats];

        const colStats = [];
        for (let i = 0; i < stats.length; i += this._maxRows) {
            colStats.push(stats.slice(i, i + this._maxRows));
        }

        return colStats;
    }

    // determines what should be shown in the tooltip
    private async _buildTooltipContent(): Promise<HTMLElement> {
        const data = this._getTooltipData();
        if (!data.stats.length) return null;

        const columns = this._breakInColumns(data.stats);
        const templateData = {
            ...data,
            stats: columns,
            numberOfColumns: columns.length,
        };

        Utils.debug(templateData);
        return renderTemplate(this._template, templateData)
    }

    // populates the tooltip container with the build content, and returns if the tooltip has content
    // should only be called by _createTooltip()
    private async _populateContainer(): Promise<boolean> {
        const content = await this._buildTooltipContent();
        if (content && this._tooltip) this._tooltip.html(content);

        return !!content;
    }

    // creates the tooltip's container
    // should only be called by _createTooltip()
    private _createContainer(): void {
        this._tooltip = $(`<div class="${this._moduleName}-tooltip-container ${this._systemClass} ${this._themeClass}"></div>`);
        this._tooltip.css({fontSize: `${this._fontSize}rem`});
    }

    // appends the tooltip's container to the body
    // should only be called by _createTooltip()
    private _appendContainerToBody(): void {
        this._gameBody.append(this._tooltip);
    }

    // returns the coordinates for the tooltip position
    // should only be called by _positionTooltip()
    private _getTooltipPosition(): any {
        const tokenWT = this._token.worldTransform;

        const padding = 5;
        const ltPadding = 20; // padding for left and top positioning

        const position = {
            zIndex: this._token.zIndex,
            color: this._accentColor,
        };

        switch (this._where) {
            case 'right': {
                position['top'] = tokenWT.ty - padding;
                position['left'] = tokenWT.tx + (this._token.w * tokenWT.a) + padding;
                break;
            }
            case 'bottom': {
                position['top'] = tokenWT.ty + (this._token.h * tokenWT.a) + padding;
                position['left'] = tokenWT.tx - padding;
                break;
            }
            case 'left': {
                const cW = this._tooltip.width();
                position['top'] = tokenWT.ty - padding;
                position['left'] = tokenWT.tx - cW - ltPadding;
                break;
            }
            case 'top': {
                const cH = this._tooltip.height();
                position['top'] = tokenWT.ty - cH - ltPadding;
                position['left'] = tokenWT.tx - padding;
                break;
            }
            case 'overlay': {
                position['top'] = tokenWT.ty - padding;
                position['left'] = tokenWT.tx - padding;
                break;
            }
            case 'isometric': {
                const cW = this._tooltip.width();
                position['top'] = tokenWT.ty;
                position['left'] = tokenWT.tx - cW;

                position['transform'] = 'rotateX(54deg) rotateY(-2deg) rotateZ(-44deg)';
                break;
            }
            case 'doubleSurprise': {
                const canvas = $('#board');
                const w = canvas.width() - this._tooltip.width();
                const h = canvas.height() - this._tooltip.height();

                position['top'] = Math.floor(Math.random() * h);
                position['left'] = Math.floor(Math.random() * w);
                break;
            }
        }

        return position;
    }

    // positions the newly created tooltip
    // should only be called by _createTooltip()
    private _positionTooltip(): void {
        if (!this._tooltip) return;

        const position = this._getTooltipPosition();
        this._tooltip.css(position);
    }

    // creates a tooltip, and only displays it if it has content
    private async _createTooltip(): Promise<void> {
        this._createContainer();

        const hasContent = await this._populateContainer();
        if (!hasContent) return;

        this._appendContainerToBody();
        this._positionTooltip();
    }

    // will first remove the tooltip from the DOM, then make the reference null
    private _destroyTooltip(): void {
        if (!this._tooltip) return;

        this._tooltip.remove();
        this._tooltip = null;
    }

    // get the assigned token's id
    public getTokenId(): string {
        return this._token?.id;
    }

    // the name is a bit misleading, this will attempt to create the tooltip,
    // then play an animation to show it
    public show(): void {
        const t = this;
        this._createTooltip().then(() => {
            switch (t._animType) {
                case 'fade': {
                    t._tooltip.css({opacity: 0});
                    t._tooltip.animate({opacity: 1}, this._animSpeed);
                    break;
                }
            }
        });
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
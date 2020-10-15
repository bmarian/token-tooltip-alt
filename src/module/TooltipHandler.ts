import Settings from "./Settings";
import Utils from "./Utils";
import stringMath from "../lib/MathEngine"

class TooltipHandler {
    private static _instance: TooltipHandler;
    private _tooltipContainer = null;
    private _visibilityTypes = {FULL: 'full', PARTIAL: 'partial', NONE: 'none'};
    private _altTooltipContainers = [];
    private _wasTabDown = false;
    private _strictPathExp = new RegExp(/^(\w+\.)+(\w+)$/);

    private constructor() {
    }

    public static getInstance(): TooltipHandler {
        if (!TooltipHandler._instance) TooltipHandler._instance = new TooltipHandler();
        return TooltipHandler._instance;
    }

    private _initializeContainer(): JQuery {
        if (!this._tooltipContainer) {
            this._tooltipContainer = $(`.${Utils.moduleName}-tooltip-container`);
            this._tooltipContainer.css('fontSize', Settings.getSetting(Settings.settingKeys.FONT_SIZE) || '1rem');
        }
        return this._tooltipContainer;
    }

    private _toggleContainer(show: boolean): void {
        this._tooltipContainer[show ? 'removeClass' : 'addClass']('hidden');
    }

    private _clearContainer(): void {
        this._tooltipContainer.empty();
    }

    private _clearAltContainers(): void {
        this._wasTabDown = false;
        while (this._altTooltipContainers.length > 0) {
            const tooltipContainer = this._altTooltipContainers.pop();
            tooltipContainer.remove();
        }
    }

    private _appendToContainer(content: any): void {
        this._clearContainer();
        this._tooltipContainer.html(content);
    }

    private _getTooltipPosition(token: any, tooltipContainer: any): any {
        let where = Settings.getSetting(Settings.settingKeys.TOOLTIP_POSITION);
        const tokenWT = token.worldTransform;

        const padding = 5;
        const leftTopPadding = 20;

        const position = {
            zIndex: token.zIndex,
            color: Settings.getSetting(Settings.settingKeys.ACCENT_COLOR)
        };

        if (where === 'surprise') {
            where = Settings.tooltipPositions[Math.floor(Math.random() * Settings.tooltipPositions.length)];
        }

        switch (where) {
            case 'right': {
                position['top'] = tokenWT.ty - padding;
                position['left'] = tokenWT.tx + (token.w * tokenWT.a) + padding;
                break;
            }
            case 'bottom': {
                position['top'] = tokenWT.ty + (token.h * tokenWT.a) + padding;
                position['left'] = tokenWT.tx - padding;
                break;
            }
            case 'left': {
                const cW = tooltipContainer.width();
                position['top'] = tokenWT.ty - padding;
                position['left'] = tokenWT.tx - cW - leftTopPadding;
                break;
            }
            case 'top': {
                const cH = tooltipContainer.height();
                position['top'] = tokenWT.ty - cH - leftTopPadding;
                position['left'] = tokenWT.tx - padding;
                break;
            }
        }

        return position;
    }

    // TODO: See if there is an efficient solution to check if tokens are in view
    private _checkIfTokenInView(token: any): boolean {
        return true;
    }

    private _positionTooltip(tooltipContainer: any, token: any): void {
        const position = this._getTooltipPosition(token, tooltipContainer);
        tooltipContainer.css(position);
    }

    private _extractNumber(value: string): any {
        const parsedValue = parseFloat(value);
        return isNaN(parsedValue) ? null : parsedValue;
    }

    private _appendSimpleStat(value: any, item: any, statsArray: Array<any>): void {
        if (typeof value !== 'string' && isNaN(value)) return;
        const v = item.isNumber ? this._extractNumber(value) : value;
        statsArray.push({value: v, icon: item?.icon, color: item?.color});
    }

    private _appendObjectStat(values: any, item: any, statsArray: Array<any>): void {
        if (!(isNaN(values.value) && isNaN(values.max))) {
            const temp = values.temp > 0 ? `(${values.temp})` : '';
            const tempmax = values.tempmax > 0 ? `(${values.tempmax})` : '';
            const value = `${values.value}${temp}/${values.max}${tempmax}`;
            statsArray.push({value, icon: item?.icon, color: item?.color});
        }
    }

    private _appendStat(item: any, value: any, statsArray: Array<any>): void {
        if (!(item && value && statsArray)) return;

        if (typeof value === 'object') {
            this._appendObjectStat(
                {
                    value: this._extractNumber(value.value),
                    max: this._extractNumber(value.max),
                    temp: this._extractNumber(value.temp),
                    tempmax: this._extractNumber(value.tempmax),
                },
                item,
                statsArray
            );
        } else {
            this._appendSimpleStat(value, item, statsArray);
        }
    }

    private _getNestedData(data: any, path: string): any {
        if (!this._strictPathExp.test(path)) return null;

        const paths = path.split('.');
        if (!paths.length) return null;

        let res = data;
        for (let i = 0; i < paths.length; i++) {
            res = res?.[paths[i]];
        }
        return res;
    }

    private _handleOperations(data: any, operation: string): any {
        const th = this;
        const o = operation.replace(/([^\d\W]+\.)+([^\d\W]+)/g, (dataPath: string) => {
            return th._extractNumber(th._getNestedData(data, dataPath));
        });
        return stringMath(o);
    }

    private _expressionHandler(data: any, expression: string): any {
        const th = this;
        return expression.replace(/{([^}]*)}/g, (_0: string, dataPath: string) => {
            const value = th[th._strictPathExp.test(dataPath) ? '_getNestedData' : '_handleOperations'](data, dataPath);
            // The explicit check is needed for values that have 0;
            return value !== null ? value : '';
        });
    }

    private _getTooltipData(token: any, visibilityType: string): any {
        const stats = [];
        const data = token?.actor?.data?.data;
        const isVisibilityFull = visibilityType === this._visibilityTypes.FULL;
        const useAccentColor = Settings.getSetting(Settings.settingKeys.USE_ACCENT_COLOR_FOR_EVERYTHING);

        const itemList = isVisibilityFull ?
            Settings.getSetting(Settings.settingKeys.TOOLTIP_ITEMS) : Settings.getSetting(Settings.settingKeys.HOSTILE_ITEMS)


        for (let i = 0; i < itemList.length; i++) {
            const item = itemList[i];

            const value = item?.expression ? this._expressionHandler(data, item?.value) : this._getNestedData(data, item?.value);
            if (useAccentColor) item.color = Settings.getSetting(Settings.settingKeys.ACCENT_COLOR);

            this._appendStat(item, value, stats);
        }

        const showTokenName = Settings.getSetting(Settings.settingKeys.DISPLAY_NAMES_IN_TOOLTIP) && isVisibilityFull;
        const tokenName = showTokenName ? token?.data?.name : null;

        if (isVisibilityFull) Utils.debug({tokenName, data});

        return {moduleName: Utils.moduleName, stats, tokenName};
    }

    private _typeToShow(token: any): string {
        const visibility = Settings.getSetting(Settings.settingKeys.TOOLTIP_VISIBILITY);

        if (game?.user?.isGM) return this._visibilityTypes.FULL;

        if (visibility !== 'gm') {
            if (token?.actor?.owner) return this._visibilityTypes.FULL;
            const isFriendly = token?.data?.disposition === CONST?.TOKEN_DISPOSITIONS?.FRIENDLY;
            const isObservable = token?.actor?.permission === CONST?.ENTITY_PERMISSIONS?.OBSERVER

            if ((isFriendly || isObservable) && (visibility === 'friendly' || visibility === 'all')) return this._visibilityTypes.FULL;
            if (visibility === 'all') return this._visibilityTypes.PARTIAL;
        }

        return this._visibilityTypes.NONE;
    }

    private _hideTooltip(): void {
        this._initializeContainer();
        this._clearContainer();
        this._toggleContainer(false);
    }

    private _appendAltTooltipContainer(tooltipHTML: any): JQuery {
        const systemClass = Settings.getSystemSpecificClass();
        const darkClass = Settings.getSetting(Settings.settingKeys.DARK_THEME) ? 'dark' : '';

        const tooltipContainer = $(`<div class="${Utils.moduleName}-tooltip-container ${systemClass} ${darkClass}"></div>`);
        tooltipContainer.css('fontSize', Settings.getSetting(Settings.settingKeys.FONT_SIZE) || '1rem');

        tooltipContainer.append(tooltipHTML);
        $('.game').append(tooltipContainer);

        return tooltipContainer;
    }

    private async _getTooltipHTML(token: any): Promise<HTMLElement> {
        const visibilityType = this._typeToShow(token);
        if (visibilityType === this._visibilityTypes.NONE) return null;

        const tooltipData = this._getTooltipData(token, visibilityType);
        if (!tooltipData.stats.length) return;

        return await renderTemplate(Settings.templatePaths[0], tooltipData);
    }

    private async _handleTooltip(token: any, isHovering: boolean): Promise<void> {
        this._initializeContainer();

        if (!isHovering) {
            this._clearContainer();
            this._toggleContainer(false);
            return;
        }

        const tooltipHTML = await this._getTooltipHTML(token);
        if (!tooltipHTML) return;

        this._appendToContainer(tooltipHTML);
        this._toggleContainer(true);
        this._positionTooltip(this._tooltipContainer, token);
    }

    private async _handleAltTooltips(token: any, isHovering: boolean): Promise<void> {
        if (!isHovering) return;

        const tooltipHTML = await this._getTooltipHTML(token);
        if (!tooltipHTML) return;

        const tooltipContainer = this._appendAltTooltipContainer(tooltipHTML);
        this._positionTooltip(tooltipContainer, token);

        this._altTooltipContainers.push(tooltipContainer);
    }

    public async hoverTokenHook(token: any, isHovering: boolean): Promise<void> {
        if (!token?.actor || !this._checkIfTokenInView(token)) return;

        const isAltPressed = keyboard?.isDown('Alt');
        if (!isAltPressed && !this._wasTabDown) {
            return this._handleTooltip(token, isHovering);
        }

        const allowShowAlt = Settings.getSetting(Settings.settingKeys.SHOW_ALL_ON_ALT);
        const showTooltipForHiddenTokens = Settings.getSetting(Settings.settingKeys.SHOW_TOOLTIP_FOR_HIDDEN_TOKENS);
        const isTokenHidden = token?.data?.hidden;

        if (!allowShowAlt || (isTokenHidden && !showTooltipForHiddenTokens)) return;

        if (!isAltPressed) {
            return this._clearAltContainers();
        }

        if (isAltPressed) {
            this._wasTabDown = true;
            return this._handleAltTooltips(token, isHovering)
        }
    }

    public hideTooltipOnHook(): void {
        this._hideTooltip();
        this._clearAltContainers();
    }
}

export default TooltipHandler.getInstance();
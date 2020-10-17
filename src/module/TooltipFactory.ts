import Tooltip from "./Tooltip";
import Settings from "./Settings";

class TooltipFactory {
    private static _instance: TooltipFactory;
    private _tooltips: Array<Tooltip> = [];

    private constructor() {
    }

    public static getInstance(): TooltipFactory {
        if (!TooltipFactory._instance) TooltipFactory._instance = new TooltipFactory();
        return TooltipFactory._instance;
    }

    // get a value from Settings
    private _getSetting(setting: string): any {
        return Settings.getSetting(setting);
    }

    // get the positioning from settings, and if surprise pick a random possible position
    private _getWhere(): string {
        let where = this._getSetting(Settings.settingKeys.TOOLTIP_POSITION) || 'right';
        if (where === 'surprise') {
            where = Settings.tooltipPositions[Math.floor(Math.random() * Settings.tooltipPositions.length)];
        }

        return where;
    }

    // create an array of data needed to initialize a tooltip
    private _getTooltipData(token: any): any {
        return [
            token,                                                              // token
            this._getSetting(Settings.settingKeys.DARK_THEME) ? 'dark' : '',    // themeClass
            Settings.getSystemSpecificClass(),                                  // systemClass
            this._getSetting(Settings.settingKeys.FONT_SIZE) || '1rem',         // fontSize
            this._getWhere(),                                                   // where
            'none',                                                             // TODO: animType
            200,                                                                // animSpeed
            this._getSetting(Settings.settingKeys.DATA_SOURCE) || '',           // path
            this._getSetting(Settings.settingKeys.TOOLTIP_VISIBILITY) || 'gm',  // visibility
            Settings.templatePaths[0],                                          // template
            $('.game'),                                                    // gameBody
        ];
    }

    // get settings for <ALT>
    private _getAltSettings(): any {
        return {
            showOnAlt: this._getSetting(Settings.settingKeys.SHOW_ALL_ON_ALT),
            showAllOnAlt: this._getSetting(Settings.settingKeys.SHOW_TOOLTIP_FOR_HIDDEN_TOKENS),
        }
    }

    // generates a tooltip if that token doesn't have one and adds it to the array, and shows it
    private _addTooltip(token: any): Tooltip {
        for (let i = 0; i < this._tooltips.length; i++) {
            const t = this._tooltips[i];
            if (t.getTokenId() === token?.id) return null;
        }

        const tooltip = new Tooltip(...this._getTooltipData(token));
        this._tooltips.push(tooltip);
        tooltip.show();
    }

    // generates a tooltip if that token doesn't have one and adds it to the array, and shows it
    private _removeTooltip(token: any): void {
        for (let i = 0; i < this._tooltips.length; i++) {
            const t = this._tooltips[i];
            if (t.getTokenId() === token?.id) {
                t.hide();
                this._tooltips.splice(i,1);
                break;
            }
        }
    }

    // removes all the tooltips and destroys the objects
    private _removeTooltips(): void {
        while (this._tooltips.length > 0) {
            this._tooltips.pop().hide();
        }
    }

    public async hoverToken(token: any, isHovering: boolean): Promise<void> {
        if (!token?.actor) return;
        this[isHovering ? '_addTooltip' : '_removeTooltip'](token);
    }

    public removeTooltips(): void {
        this._removeTooltips();
    }
}

export default TooltipFactory.getInstance();
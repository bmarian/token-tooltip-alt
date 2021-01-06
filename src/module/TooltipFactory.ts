import Tooltip from "./Tooltip";
import {CONSTANTS, getSystemTheme} from "./enums/Constants";
import SettingsUtil from "./settings/SettingsUtil";
import Utils from "./Utils";

class TooltipFactory {
    private static _instance: TooltipFactory;
    private _tooltips: Array<Tooltip> = [];
    private _settingKeys = CONSTANTS.SETTING_KEYS;

    private constructor() {
    }

    public static getInstance(): TooltipFactory {
        if (!TooltipFactory._instance) TooltipFactory._instance = new TooltipFactory();
        return TooltipFactory._instance;
    }

    // get a value from Settings
    private _getSetting(setting: string): any {
        return SettingsUtil.getSetting(setting);
    }

    // get the positioning from settings, and if surprise pick a random possible position
    private _getWhere(): string {
        const where = this._getSetting(this._settingKeys.TOOLTIP_POSITION) || 'right';
        const isIsometricActive = game?.modules?.get("grape_juice-isometrics")?.active;

        if (isIsometricActive) {
            // @ts-ignore
            const isIsometricMap = game?.scenes?.viewed?.getFlag('grape_juice-isometrics', 'is_isometric');
            const isIsometric = this._getSetting(this._settingKeys.ISOMETRIC);

            if (isIsometric && isIsometricMap) return this._settingKeys.ISOMETRIC;
        }

        const positions = CONSTANTS.TOOLTIP_POSITIONS;
        return where !== 'surprise' ? where : positions[Math.floor(Math.random() * positions.length)];
    }

    // returns some useful info used in the tooltip,
    // if the user is a GM, and the actor type
    private _getTooltipInfo(token: any): any {
        return {
            isGM: game?.user?.isGM,
            actorType: token?.actor?.data?.type
        };
    }

    // create an array of data needed to initialize a tooltip
    private _getTooltipData(token: any): any {
        return [
            token,                                                                  // token
            this._getSetting(this._settingKeys.DARK_THEME) ? 'dark' : 'light',      // themeClass
            getSystemTheme(),                                                       // systemClass
            parseFloat(this._getSetting(this._settingKeys.FONT_SIZE)) || 1,         // fontSize
        this._getWhere(),                                                           // where
            'none',                                                                 // animType
            200,                                                                    // animSpeed
            this._getSetting(this._settingKeys.DATA_SOURCE) || '',                  // path
            CONSTANTS.TEMPLATES.TOOLTIP,                                            // template
            $('.game'),                                                         // gameBody
            this._getTooltipInfo(token),                                            // tooltipInfo
        ];
    }

    // get settings for <ALT>
    private _getAltSettings(): any {
        return {
            showOnAlt: this._getSetting(this._settingKeys.SHOW_ALL_ON_ALT),
            showAllOnAlt: this._getSetting(this._settingKeys.SHOW_TOOLTIP_FOR_HIDDEN_TOKENS),
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
                this._tooltips.splice(i, 1);
                break;
            }
        }
    }

    // determines if a token should display a tooltip or not based on the ACTORS settings
    private _shouldActorHaveTooltip(token: any): boolean {
        const noTooltip = token.getFlag(Utils.moduleName, 'noTooltip');
        if (noTooltip) return false;

        const actorType = token?.actor?.data?.type;
        const actors = this._getSetting(this._settingKeys.ACTORS);
        for (let i = 0; i < actors.length; i++) {
            const actor = actors[i];
            if (actor.id === actorType) return actor.enable;
        }
        return true;
    }

    // removes all the tooltips and destroys the objects
    private _removeTooltips(): void {
        while (this._tooltips.length > 0) {
            this._tooltips.pop().hide();
        }
    }

    // public hook when hovering over a token (more precise when a token is focused)
    public async hoverToken(token: any, isHovering: boolean): Promise<void> {
        if (!token?.actor || !this._shouldActorHaveTooltip(token)) return;

        const isAltPressed = keyboard?.isDown('Alt');

        if (isAltPressed) {
            const altSettings = this._getAltSettings();
            if (!altSettings.showOnAlt) return;

            const isTokenHidden = token?.data?.hidden;
            if (altSettings.showOnAlt && !altSettings.showAllOnAlt && isTokenHidden) return;
        }

        this[isHovering ? '_addTooltip' : '_removeTooltip'](token);
    }

    // public hook to remove all tooltips
    public removeTooltips(): void {
        this._removeTooltips();
    }
}

export default TooltipFactory.getInstance();
import Tooltip from "./Tooltip";
import Settings from "./Settings";

class TooltipFactory {
    private static _instance: TooltipFactory;
    private tooltips: Array<Tooltip> = [];

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

    public async hoverToken(token: any, isHovering: boolean): Promise<void> {
    }

    public removeTooltips(): void {
    }
}

export default TooltipFactory.getInstance();
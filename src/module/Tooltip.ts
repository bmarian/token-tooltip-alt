import Utils from "./Utils";
import Settings from "./Settings";

class Tooltip {
    private _reg = {
        // searches if the string is one path
        path: new RegExp(/^([\w_-]+\.)*([\w_-]+)$/),
        // searches for all the paths in a string
        paths: new RegExp(/([\w_-]+\.)*([\w_-]+)/g),
        // determines if the string is a number
        number: new RegExp(/\d+/),
        // searches for all the paths inside {}
        expressions: new RegExp(/{([^}]*)}/g),
    }
    private _tooltip = null;

    private readonly _token;
    private readonly _themeClass;
    private readonly _systemClass;
    private readonly _fontSize;
    private readonly _where;
    private readonly _animType;
    private readonly _animSpeed;
    private readonly _gameBody;

    constructor(token: any, themeClass: string, systemClass: string, fontSize: string, where: string, animType: string, animSpeed: number) {
        this._token = token;
        this._themeClass = themeClass;
        this._systemClass = systemClass;
        this._fontSize = fontSize;
        this._where = where;
        this._animType = animType;
        this._animSpeed = animSpeed;

        this._gameBody = $('.game');
    }

    // creates the tooltip's container
    // should only be called by _createTooltip()
    private _createContainer(): void {
        this._tooltip = $(`<div class="${Utils.moduleName}-tooltip-container ${this._systemClass} ${this._themeClass}"></div>`);
        this._tooltip.css({fontSize: this._fontSize}).css('display', 'none');
    }

    // appends the tooltip's container to the body
    // should only be called by _createTooltip()
    private _appendContainerToBody(): void {
        this._gameBody.append(this._tooltip);
    }

    // creates a tooltip
    private _createTooltip(): void {
        this._createContainer();
        this._appendContainerToBody();
        // TODO append data to tooltip
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
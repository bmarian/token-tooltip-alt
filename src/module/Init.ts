import Settings from "./Settings";
import Utils from "./Utils";
import TooltipHandler from "./TooltipHandler";

class Init {
    private static _instance: Init;

    private constructor() {
    }

    public static getInstance(): Init {
        if (!Init._instance) Init._instance = new Init();
        return Init._instance;
    }

    private _loadTemplates(): Promise<void> {
        return loadTemplates(Settings.templatePaths);
    }

    public async initHook(): Promise<void> {
        Settings.registerSettings();
        await this._loadTemplates();

        Utils.debug('Module initialized.', false);
    }

    public async canvasInitHook(): Promise<void> {
        $(window).on('blur', TooltipHandler.hideTooltipOnHook.bind(TooltipHandler));
        $(window).on('keyup', (ev) => {
            if (ev.key === 'Alt') TooltipHandler.hideTooltipOnHook();
        });
    }
}

export default Init.getInstance();
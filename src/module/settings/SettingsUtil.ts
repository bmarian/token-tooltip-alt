import Utils from "../Utils";

class SettingsUtil {
    private static _instance: SettingsUtil;
    public static getInstance(): SettingsUtil {
        if (!SettingsUtil._instance) SettingsUtil._instance = new SettingsUtil();
        return SettingsUtil._instance;
    }

    private readonly _moduleName;
    private constructor() {
        this._moduleName = Utils.moduleName;
    }

    // gets the value of a setting
    public getSetting(key: string): any {
        return game?.settings?.get(this._moduleName, key);
    }

    // sets a value for a setting
    public setSetting(key: string, data: any): void {
        const status = game?.settings?.set(this._moduleName, key, data);
    }

    // registers a setting
    private _registerSetting(key: string, data: any): void {
        game?.settings?.register(this._moduleName, key, data);
    }

    // registers an array of settings
    public registerSettings(items: any): void {
        const su = this;
        items.forEach((item) => {
            su._registerSetting(item.key, item.settings);
        });
    }

    // registers a menu
    public registerMenu(key: string, data: any):void {
        game?.settings?.registerMenu(this._moduleName, key, data);
    }

}

export default SettingsUtil.getInstance();
class Utils {
    private static _instance: Utils;
    private readonly _debugging: boolean;
    private readonly _trace: boolean;
    public readonly moduleName: string = 'token-tooltip-alt';
    public readonly moduleTitle: string = 'Token Tooltip Alt';

    private constructor(debugging: boolean, trace: boolean) {
        this._debugging = debugging;
        this._trace = trace;

        if (debugging) CONFIG.debug.hooks = debugging;
    }

    public static getInstance(debugging: boolean, trace: boolean): Utils {
        if (!Utils._instance) Utils._instance = new Utils(debugging, trace);
        return Utils._instance;
    }

    private _consoleLog(output: any): void {
        console.log(
            `%c${this.moduleTitle} %c|`,
            'background: #222; color: #bada55',
            'color: #fff',
            output
        );
    }

    private _consoleTrace(output: any): void {
        console.groupCollapsed(
            `%c${this.moduleTitle} %c|`,
            'background: #222; color: #bada55',
            'color: #fff',
            output
        );
        console.trace();
        console.groupEnd();
    }

    public debug(output?: any, doTrace?: boolean): void {
        const isDebugOptionTrue = game?.settings?.get(this.moduleName, 'debugOutput');
        if (!(this._debugging || isDebugOptionTrue)) return;

        if (this._trace && doTrace !== false) {
            this._consoleTrace(output);
        } else {
            this._consoleLog(output);
        }
    }

    public randomColorPicker(): string {
        return `#${Math.round((Math.random() * 0xFFFFFF)).toString(16).padStart(6, '0')}`;
    }

    public clone(obj: any): any {
        return JSON.parse(JSON.stringify(obj));
    }
}

export default Utils.getInstance(false, true);
class Utils {
    constructor(debugging, trace) {
        this.moduleName = 'token-tooltip-alt';
        this.moduleTitle = 'Token Tooltip Alt';
        this._debugging = debugging;
        this._trace = trace;
        if (debugging)
            CONFIG.debug.hooks = debugging;
    }
    static getInstance(debugging, trace) {
        if (!Utils._instance)
            Utils._instance = new Utils(debugging, trace);
        return Utils._instance;
    }
    _consoleLog(output) {
        console.log(`%c${this.moduleTitle} %c|`, 'background: #222; color: #bada55', 'color: #fff', output);
    }
    _consoleTrace(output) {
        console.groupCollapsed(`%c${this.moduleTitle} %c|`, 'background: #222; color: #bada55', 'color: #fff', output);
        console.trace();
        console.groupEnd();
    }
    debug(output, doTrace) {
        const isDebugOptionTrue = game?.settings?.get(this.moduleName, 'debugOutput');
        if (!(this._debugging || isDebugOptionTrue))
            return;
        if (this._trace && doTrace !== false) {
            this._consoleTrace(output);
        }
        else {
            this._consoleLog(output);
        }
    }
    randomColorPicker() {
        return `#${Math.round((Math.random() * 0xFFFFFF)).toString(16).padStart(6, '0')}`;
    }
    clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    i18n(path) {
        return game.i18n.localize(`${this.moduleName}.${path}`);
    }
}
export default Utils.getInstance(false, true);

import SettingsUtil from "../module/settings/SettingsUtil";
import {CONSTANTS} from "../module/enums/Constants";
import Utils from "../module/Utils";

export default class TooltipManager extends FormApplication {
    static get defaultOptions(): any {
        return {
            ...super.defaultOptions,
            title: 'Tooltip manager',
            template: CONSTANTS.APPS.TOOLTIP_MANAGER,
            width: CONSTANTS.APPS.TOOLTIP_MANAGER_WIDTH,
            submitOnChange: true,
        };
    }

    // get a value from Settings
    private _getSetting(key: string): any {
        return SettingsUtil.getSetting(key);
    }

    // get a value from Settings
    private _setSetting(key: string, value: any): any {
        return SettingsUtil.setSetting(key, value);
    }

    // generate a preset for a newly added system actor
    private _actorPreset(actor: string): any {
        return {
            id: actor,
            enable: true,
            custom: false,
        }
    }

    // generate a list of actors
    private _getActorsList(): any {
        const systemActors = game?.system?.entityTypes?.Actor || [];
        let actors = this._getSetting(CONSTANTS.SETTING_KEYS.ACTORS);
        let returnActors = [];
        if (!systemActors.length) return returnActors;

        const check = actors.length > 0;

        // this will take all the system actors and add them to the actors list
        // doing it every time in case a new actor was added or one was modified
        // if a new actor was added make a preset for it
        for (let i = 0; i < systemActors.length; i++) {
            const systemActor = systemActors[i];
            let add = true;
            if (check) {
                for (let j = 0; j < actors.length; j++) {
                    const actor = actors[j];
                    if (systemActor === actor.id) {
                        add = false;
                        break;
                    }
                }
            }
            if (add) {
                actors.push(this._actorPreset(systemActor));
            }
        }

        for (let i = 0; i < actors.length; i++) {
            const actor = actors[i];
            if (actor.removed || !systemActors.includes(actor.id)) actor.removed = true;
            else returnActors.push(actor);
        }

        this._setSetting(CONSTANTS.SETTING_KEYS.ACTORS, returnActors);
        return returnActors;
    }

    public getData(options?: {}): any {
        return {
            options: this.options,
            moduleName: Utils.moduleName,
            actors: this._getActorsList(),
        };
    }

    protected async _updateObject(event: Event | JQuery.Event, formData: any): Promise<any> {
    }

    public activateListeners($html: JQuery<HTMLElement>): void {
        super.activateListeners($html);
    }
}
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
            closeOnSubmit: false,
            submitOnClose: false,
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
            id: actor, // should be checked against token.actor.data.type
            enable: true,
            custom: false,
        }
    }

    // generate a list of actors, to delete it just use in the console
    // game.settings.set('token-tooltip-alt', 'actors', [])
    private _getActorsList(): any {
        const systemActors = game?.system?.entityTypes?.Actor || [];
        let actors = this._getSetting(CONSTANTS.SETTING_KEYS.ACTORS);
        let returnActors = [];
        if (!systemActors.length) return returnActors;

        const check = actors.length > 0;

        // if the actors array is empty we need to add a default, this will
        // happen only the first time this menu is opened
        if (!check) {
            const defaultActor = {
                ...this._actorPreset(CONSTANTS.APPS.TOOLTIP_DEFAULT_ACTOR_ID),
                isDefault: true,
            };
            actors.push(defaultActor);
        }

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

        // this will take care of the changed values, it will add a new property 'removed',
        // redundant for now but maybe I will implement a way of transferring the old
        // tooltips from that one
        for (let i = 0; i < actors.length; i++) {
            const actor = actors[i];

            if (actor.id !== CONSTANTS.APPS.TOOLTIP_DEFAULT_ACTOR_ID && (actor.removed || !systemActors.includes(actor.id))) actor.removed = true;
            else returnActors.push(actor);
        }

        this._setSetting(CONSTANTS.SETTING_KEYS.ACTORS, returnActors);
        return returnActors;
    }

    // returns the data used by the tooltip-manager.hbs template
    public getData(options?: {}): any {
        return {
            options: this.options,
            moduleName: Utils.moduleName,
            actors: this._getActorsList(),
        };
    }

    // save the new settings for actors on every submit
    // (with the current implementation this means on every change event)
    // this SHOULD be light weight enough to not create any problems and
    // to keep the UX nice
    protected async _updateObject(event: Event | JQuery.Event, formData: any): Promise<any> {
        const expObj = expandObject(formData);
        const actors = this._getSetting(CONSTANTS.SETTING_KEYS.ACTORS);

        for (let key in expObj) {
            if (!expObj.hasOwnProperty(key)) continue;
            const values = expObj[key];

            for (let i = 0; i < actors.length; i++) {
                const actor = actors[i];
                if (actor.id === key) {
                    actor.enable = values.enable;
                    actor.custom = values.custom;
                }
            }
        }

        Utils.debug(actors);
        this._setSetting(CONSTANTS.SETTING_KEYS.ACTORS, actors);
    }

    public activateListeners($html: JQuery<HTMLElement>): void {
        super.activateListeners($html);
        // new ImportWindow().render(true); initializing a new window
    }
}
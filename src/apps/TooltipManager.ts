import SettingsUtil from "../module/settings/SettingsUtil";
import {CONSTANTS} from "../module/enums/Constants";
import Utils from "../module/Utils";
import TooltipEditor from "./TooltipEditor";

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

    // generate a default entry for GM items for a token disposition
    private _generateDefaultSettingsForDisposition(disposition): any {
        return {
            disposition,
            items: [],
        }
    }

    // create default static settings for
    // name - true for gm / the last tokenDisposition in the array
    // accentColor - #000000
    // use accent color for everything - false
    // token dispositions - always adding the latest one
    private _createDefaultStatics(staticSettings: any, isPlayer: boolean, tokenDispositions: Array<string>): void {
        const name = CONSTANTS.SETTING_KEYS.DISPLAY_NAMES_IN_TOOLTIP;
        const accentColor = CONSTANTS.SETTING_KEYS.ACCENT_COLOR;
        const useAccentEverywhere = CONSTANTS.SETTING_KEYS.USE_ACCENT_COLOR_FOR_EVERYTHING;
        const tokenDis = CONSTANTS.SETTING_KEYS.TOKEN_DISPOSITIONS;

        if (!(name in staticSettings)) staticSettings[name] = isPlayer ? tokenDispositions?.[0] : true;
        if (!(accentColor in staticSettings)) staticSettings[accentColor] = '#000000';
        if (!(useAccentEverywhere in staticSettings)) staticSettings[useAccentEverywhere] = false;
        staticSettings[tokenDis] = tokenDispositions;
    }

    // check if no defaults are present for a disposition and creates them
    private _createDefaultSettings(entitySettings: Array<any>, tokenDispositions: Array<string>): void {
        let add;

        for (let i = 0; i < tokenDispositions.length; i++) {
            const tokenDisposition = tokenDispositions[i];
            add = true;

            for (let j = 0; j < entitySettings.length; j++) {
                const entitySetting = entitySettings[j];
                if (tokenDisposition === entitySetting.disposition) {
                    add = false;
                    break;
                }
            }

            if (add) entitySettings.push(this._generateDefaultSettingsForDisposition(tokenDisposition));
        }
    }

    // this is used in case a module or system plays with the dispositions, or if in
    // the future they will be changed
    private _removeDeprecatedSettings(entitySettings: Array<any>, tokenDispositions: Array<string>, returnArray: Array<any>): void {
        for (let i = 0; i < entitySettings.length; i++) {
            const entitySetting = entitySettings[i];

            if (entitySetting.removed || !tokenDispositions.includes(entitySetting.disposition)) entitySetting.removed = true;
            else returnArray.push(entitySetting);
        }
    }

    // handles the settings for the current actorType (getting the current settings if present, or creating
    // defaults if nothing is there)
    // game.settings.set('token-tooltip-alt', 'gmSettings', {}); game.settings.set('token-tooltip-alt', 'playerSettings', {});
    private async _generateSettingsListForActorType(actorType): Promise<any> {
        const returnGmItems = [];
        const returnPlayerItems = [];
        const tokenDispositions = Object.keys(CONST?.TOKEN_DISPOSITIONS)?.reverse();

        const gmSettings = this._getSetting(CONSTANTS.SETTING_KEYS.GM_SETTINGS);
        const playerSettings = this._getSetting(CONSTANTS.SETTING_KEYS.PLAYER_SETTINGS);

        // get the settings for the current actorType
        const gmSettingsForType = gmSettings[actorType] || {};
        const playerSettingsForType = playerSettings[actorType] || {};

        // get the items
        const gmItems = gmSettingsForType.items || [];
        const playerItems = playerSettingsForType.items || [];

        // get the 'static' options (color, display name, etc)
        const gmStatic = gmSettingsForType.static || {};
        const playerStatic = playerSettingsForType.static || {};

        // verify/create the values for items
        this._createDefaultSettings(gmItems, tokenDispositions);
        this._createDefaultSettings(playerItems, tokenDispositions);
        this._removeDeprecatedSettings(gmItems, tokenDispositions, returnGmItems);
        this._removeDeprecatedSettings(playerItems, tokenDispositions, returnPlayerItems);

        // verify/create the values for static
        this._createDefaultStatics(gmStatic, false, tokenDispositions);
        this._createDefaultStatics(playerStatic, true, tokenDispositions);

        // set the new values
        gmSettingsForType.items = returnGmItems;
        playerSettingsForType.items = returnPlayerItems;
        gmSettingsForType.static = gmStatic;
        playerSettingsForType.static = playerStatic;
        gmSettings[actorType] = gmSettingsForType;
        playerSettings[actorType] = playerSettingsForType;

        await this._setSetting(CONSTANTS.SETTING_KEYS.GM_SETTINGS, gmSettings);
        await this._setSetting(CONSTANTS.SETTING_KEYS.PLAYER_SETTINGS, playerSettings);

        Utils.debug({gmSettings: gmSettingsForType, playerSettings: playerSettingsForType});
    }

    // get a value from Settings
    private _getSetting(key: string): any {
        return SettingsUtil.getSetting(key);
    }

    // get a value from Settings
    private async _setSetting(key: string, value: any): Promise<any> {
        return await SettingsUtil.setSetting(key, value);
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
    private async _getActorsList(): Promise<any> {
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
            if (add) actors.push(this._actorPreset(systemActor));
        }

        // this will take care of the changed values, it will add a new property 'removed',
        // redundant for now but maybe I will implement a way of transferring the old
        // tooltips from that one
        for (let i = 0; i < actors.length; i++) {
            const actor = actors[i];

            if (actor.id !== CONSTANTS.APPS.TOOLTIP_DEFAULT_ACTOR_ID && (actor.removed || !systemActors.includes(actor.id))) actor.removed = true;
            else {
                await this._generateSettingsListForActorType(actor.id);
                returnActors.push(actor);
            }

        }

        await this._setSetting(CONSTANTS.SETTING_KEYS.ACTORS, returnActors);
        return returnActors;
    }

    // returns the data used by the tooltip-manager.hbs template
    public async getData(options?: {}): Promise<any> {
        const actorList = await this._getActorsList();
        return {
            moduleName: Utils.moduleName,
            actors: actorList,
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
        await this._setSetting(CONSTANTS.SETTING_KEYS.ACTORS, actors);
    }

    // the click event for the edit buttons
    private _openTooltipEditor(): void {
        const $this = $(this);
        const actorType = $this.attr('name');
        if (!actorType) return;
        const te = new TooltipEditor({actorType}, {title: actorType.toUpperCase(), classes: [`${Utils.moduleName}-tooltip-editor-window`]});

        // TODO: See if there is an option to not display multiple tooltip editors
        te.render(true);
        Utils.debug(`Opened an editor for: ${actorType}`)
    }

    // adds the events for the open editor buttons
    public activateListeners($html: JQuery<HTMLElement>): void {
        super.activateListeners($html);
        $html.find(`.${Utils.moduleName}-row_button.edit`).on('click', this._openTooltipEditor)
    }
}
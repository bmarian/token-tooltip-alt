import SettingsUtil from "../settings/SettingsUtil.js";
import { CONSTANTS } from "../enums/Constants.js";
import Utils from "../Utils.js";
import TooltipEditor from "./TooltipEditor.js";
import DataManager from "./DataManager.js";

export default class TooltipManager extends FormApplication {
    static get defaultOptions() {
        return {
            ...super.defaultOptions,
            title: 'Tooltip manager',
            id: 'tooltip-manager',
            template: CONSTANTS.APPS.TOOLTIP_MANAGER,
            width: CONSTANTS.APPS.TOOLTIP_MANAGER_WIDTH,
            submitOnChange: true,
            closeOnSubmit: false,
            submitOnClose: false,
        };
    }
    // generate a default entry for GM items for a token disposition
    _generateDefaultSettingsForDisposition(disposition) {
        return {
            disposition,
            items: [],
        };
    }
    // create default static settings for
    // name - true for gm / the last tokenDisposition in the array
    // accentColor - #000000
    // use accent color for everything - false
    // token dispositions - always adding the latest one
    _createDefaultStatics(staticSettings, isPlayer, tokenDispositions) {
        const name = CONSTANTS.SETTING_KEYS.DISPLAY_NAMES_IN_TOOLTIP;
        const accentColor = CONSTANTS.SETTING_KEYS.ACCENT_COLOR;
        const useAccentEverywhere = CONSTANTS.SETTING_KEYS.USE_ACCENT_COLOR_FOR_EVERYTHING;
        const tokenDis = CONSTANTS.SETTING_KEYS.TOKEN_DISPOSITIONS;
        if (!(name in staticSettings))
            staticSettings[name] = isPlayer ? tokenDispositions?.[0] : true;
        if (!(accentColor in staticSettings))
            staticSettings[accentColor] = Utils.randomColorPicker();
        if (!(useAccentEverywhere in staticSettings))
            staticSettings[useAccentEverywhere] = false;
        staticSettings[tokenDis] = tokenDispositions;
    }
    // check if no defaults are present for a disposition and creates them
    _createDefaultSettings(entitySettings, tokenDispositions) {
        for (let i = 0; i < tokenDispositions.length; i++) {
            const tokenDisposition = tokenDispositions[i];
            if (entitySettings?.[i]?.disposition !== tokenDisposition) {
                entitySettings.splice(i, 0, this._generateDefaultSettingsForDisposition(tokenDisposition));
            }
        }
    }
    // this is used in case a module or system plays with the dispositions, or if in
    // the future they will be changed
    _removeDeprecatedSettings(entitySettings, tokenDispositions, returnArray) {
        for (let i = 0; i < entitySettings.length; i++) {
            const entitySetting = entitySettings[i];
            if (entitySetting.removed || !tokenDispositions.includes(entitySetting.disposition))
                entitySetting.removed = true;
            else
                returnArray.push(entitySetting);
        }
    }
    // handles the settings for the current actorType (getting the current settings if present, or creating
    // defaults if nothing is there)
    // game.settings.set('token-tooltip-alt', 'gmSettings', {}); game.settings.set('token-tooltip-alt', 'playerSettings', {});
    async _generateSettingsListForActorType(actorType) {
        const returnGmItems = [];
        const returnPlayerItems = [];
        const tokenDispositions = Object.keys(CONST?.TOKEN_DISPOSITIONS)?.reverse();
        const gmDispositions = Utils.clone(tokenDispositions);
        const playerDispositions = [CONSTANTS.APPS.OWNED_DISPOSITION, ...Utils.clone(tokenDispositions)];
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
        this._createDefaultSettings(gmItems, gmDispositions);
        this._createDefaultSettings(playerItems, playerDispositions);
        this._removeDeprecatedSettings(gmItems, gmDispositions, returnGmItems);
        this._removeDeprecatedSettings(playerItems, playerDispositions, returnPlayerItems);
        // verify/create the values for static
        this._createDefaultStatics(gmStatic, false, gmDispositions);
        this._createDefaultStatics(playerStatic, true, playerDispositions);
        // set the new values
        gmSettingsForType.items = returnGmItems;
        playerSettingsForType.items = returnPlayerItems;
        gmSettingsForType.static = gmStatic;
        playerSettingsForType.static = playerStatic;
        gmSettings[actorType] = gmSettingsForType;
        playerSettings[actorType] = playerSettingsForType;
        await this._setSetting(CONSTANTS.SETTING_KEYS.GM_SETTINGS, gmSettings);
        await this._setSetting(CONSTANTS.SETTING_KEYS.PLAYER_SETTINGS, playerSettings);
        Utils.debug({ gmSettings: gmSettingsForType, playerSettings: playerSettingsForType });
    }
    // get a value from Settings
    _getSetting(key) {
        return SettingsUtil.getSetting(key);
    }
    // get a value from Settings
    async _setSetting(key, value) {
        return await SettingsUtil.setSetting(key, value);
    }
    // generate a preset for a newly added system actor
    _actorPreset(actor) {
        return {
            id: actor,
            enable: true,
            custom: false,
        };
    }
    // generate a list of actors, to delete it just use in the console
    // game.settings.set('token-tooltip-alt', 'actors', [])
    async _getActorsList() {
        const systemActors = game?.system?.entityTypes?.Actor || [];
        let actors = this._getSetting(CONSTANTS.SETTING_KEYS.ACTORS);
        let returnActors = [];
        if (!systemActors.length)
            return returnActors;
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
            if (add)
                actors.push(this._actorPreset(systemActor));
        }
        // this will take care of the changed values, it will add a new property 'removed',
        // redundant for now but maybe I will implement a way of transferring the old
        // tooltips from that one
        for (let i = 0; i < actors.length; i++) {
            const actor = actors[i];
            if (actor.id !== CONSTANTS.APPS.TOOLTIP_DEFAULT_ACTOR_ID && (actor.removed || !systemActors.includes(actor.id)))
                actor.removed = true;
            else {
                await this._generateSettingsListForActorType(actor.id);
                returnActors.push(actor);
            }
        }
        await this._setSetting(CONSTANTS.SETTING_KEYS.ACTORS, returnActors);
        return returnActors;
    }
    // returns the data used by the tooltip-manager.hbs template
    async getData(options) {
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
    async _updateObject(event, formData) {
        const expObj = expandObject(formData);
        const actors = this._getSetting(CONSTANTS.SETTING_KEYS.ACTORS);
        for (let key in expObj) {
            if (!expObj.hasOwnProperty(key))
                continue;
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
    _openTooltipEditor() {
        const $this = $(this);
        const actorType = $this.attr('name');
        if (!actorType)
            return;
        const te = new TooltipEditor({ actorType }, {
            title: actorType.toUpperCase(),
            classes: [`${Utils.moduleName}-tooltip-editor-window`],
            id: `tooltip-editor-${actorType}`,
        });
        te.render(true);
        Utils.debug(`Opened an editor for: ${actorType}.`);
    }
    _openDataManager(ev) {
        const type = $(ev.target).closest('button').attr('name');
        const dm = new DataManager({ type });
        dm.render(true);
        Utils.debug('Opened a data manager window.');
    }
    // adds the events for the open editor buttons
    activateListeners($html) {
        super.activateListeners($html);
        $html.find(`.${Utils.moduleName}-row_button.edit`).on('click', this._openTooltipEditor);
        $html.find(`.${Utils.moduleName}-footer_button.import`).on('click', this._openDataManager);
        $html.find(`.${Utils.moduleName}-footer_button.export`).on('click', this._openDataManager);
    }
}

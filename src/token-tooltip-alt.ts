import TooltipHandler from "./module/TooltipHandler";
import Settings from "./module/Settings";
import Utils from "./module/Utils";

Hooks.once('init', async () => {
    Settings.registerSettings();
    Utils.debug('Settings registered.');

    await loadTemplates(Settings.templatePaths);
    Utils.debug('Templates loaded.');
});

Hooks.once('canvasInit', () => {
    $(window).on('blur', TooltipHandler.hideTooltipOnHook.bind(TooltipHandler));
    $(window).on('keyup', (ev) => {
        if (ev.key === 'Alt') TooltipHandler.hideTooltipOnHook();
    });
});

Hooks.on('hoverToken', TooltipHandler.hoverTokenHook.bind(TooltipHandler));
Hooks.on('preUpdateToken', TooltipHandler.hideTooltipOnHook.bind(TooltipHandler));
Hooks.on('canvasPan', TooltipHandler.hideTooltipOnHook.bind(TooltipHandler));
Hooks.on('renderTokenHUD', () => {
    // TODO: Follow the TokenHUD branch for a better fix... maybe!?
    const hasHealthEstimate = game?.modules?.get('healthEstimate')?.active;
    if (hasHealthEstimate) return;
    TooltipHandler.hideTooltipOnHook();
});
Hooks.on('deleteToken', TooltipHandler.hideTooltipOnHook.bind(TooltipHandler));


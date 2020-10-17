import Settings from "./module/Settings";
import Utils from "./module/Utils";
import TooltipFactory from "./module/TooltipFactory";

Hooks.once('init', async () => {
    Settings.registerSettings();
    Utils.debug('Settings registered.');

    await loadTemplates(Settings.templatePaths);
    Utils.debug('Templates loaded.');
});

Hooks.once('canvasInit', () => {
    $(window).on('blur', TooltipFactory.removeTooltips.bind(TooltipFactory));
    $(window).on('keyup', (ev) => {
        if (ev.key === 'Alt') TooltipFactory.removeTooltips();
    });
});

Hooks.on('hoverToken', TooltipFactory.hoverToken.bind(TooltipFactory));
Hooks.on('preUpdateToken', TooltipFactory.removeTooltips.bind(TooltipFactory));
Hooks.on('canvasPan', TooltipFactory.removeTooltips.bind(TooltipFactory));
Hooks.on('renderTokenHUD', () => {
    // TODO: Follow the TokenHUD branch for a better fix... maybe!?
    const hasHealthEstimate = game?.modules?.get('healthEstimate')?.active;
    if (hasHealthEstimate) return;
    TooltipFactory.removeTooltips();
});
Hooks.on('deleteToken', TooltipFactory.removeTooltips.bind(TooltipFactory));


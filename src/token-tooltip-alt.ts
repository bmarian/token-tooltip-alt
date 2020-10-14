import Init from "./module/Init";
import TooltipHandler from "./module/TooltipHandler";

Hooks.once('init', Init.initHook.bind(Init));
Hooks.once('canvasInit', Init.canvasInitHook.bind(Init));
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


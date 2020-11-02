const moduleName = "token-tooltip-alt";
const tooltipItems = "tooltipItems";
const hostileItems = "hostileItems";
const currentSettings = "gmSettings"

const oldItems = game.settings.get(moduleName, tooltipItems);
const oldHItems = game.settings.get(moduleName, hostileItems);
const settings = game.settings.get(moduleName, currentSettings);


const friendly = settings.default.items.find((i) => i.disposition === "FRIENDLY");
friendly.items = oldItems;

const hostile = settings.default.items.find((i) => i.disposition === "HOSTILE");
hostile.items = oldHItems;

game.settings.set(moduleName, currentSettings, settings);
import Settings from '../settings/Settings';
import { CONSTANTS } from '../enums/Constants';
import _ from '../lib/TTALodash.js';
import TTAUtils from '../TTAUtils/TTAUtils.js';
import TooltipFactory from '../TooltipFactory';

/**
 * Adds a hook handler
 *
 * @param {string} hookId
 * @param {string} hookType
 * @param {Function} callback
 */
function addHookHandler(hookId, hookType, callback) {
  return Hooks[hookType](hookId, callback);
}

/**
 * @type {{ONCE: string, OFF: string, ON: string}}
 */
const HOOK_TYPE = {
  ONCE: 'once',
  ON: 'on',
  OFF: 'off',
};

const hookHandlers = {
  initHookHandler() {
    return addHookHandler('init', HOOK_TYPE.ONCE, async () => {
      const settings = Settings.getInstance();
      settings.registerSettings();

      TTAUtils.debug('Settings registered.');
      await loadTemplates(Object.values(CONSTANTS.TEMPLATES));
      TTAUtils.debug('Templates loaded.');
    });
  },
  canvasInitHandler() {
    return addHookHandler('canvasInit', HOOK_TYPE.ONCE, () => {
      window.addEventListener('blur', TooltipFactory.removeTooltips.bind(TooltipFactory));
      window.addEventListener('keyup', (evt) => {
        if (evt.key === 'Alt') TooltipFactory.removeTooltips();
      });
    });
  },
  hoverTokenHandler() {
    return addHookHandler('canvasInit', HOOK_TYPE.ONCE, TooltipFactory.hoverToken.bind(TooltipFactory));
  },
  removeTooltipHandlers() {
    ['preUpdateToken', 'canvasPan', 'deleteToken'].forEach((hook) => {
      addHookHandler(hook, HOOK_TYPE.ON, TooltipFactory.removeTooltips.bind(TooltipFactory));
    });
    addHookHandler('renderTokenHUD', HOOK_TYPE.ON, () => {
      const hasHealthEstimate = game.modules.get('healthEstimate')?.active;
      if (hasHealthEstimate) return;

      TooltipFactory.removeTooltips();
    });
  },
};

function registerHandlers() {
  _.mapValues(hookHandlers, (handlers) => handlers());
}

export default { registerHandlers };

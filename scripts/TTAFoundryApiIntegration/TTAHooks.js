import Settings from '../settings/Settings.js';
import { CONSTANTS } from '../enums/Constants.js';
import TTAUtils from '../TTAUtils/TTAUtils.js';
import TooltipFactory from '../TooltipFactory.js';
import Utils from '../Utils.js';

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
    return addHookHandler('hoverToken', HOOK_TYPE.ON, TooltipFactory.hoverToken.bind(TooltipFactory));
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
  renderTokenConfigHandler() {
    return addHookHandler('renderTokenConfig', HOOK_TYPE.ON, (tokenConfig, $tokenConfig) => {
      const tokenConfigElement = $tokenConfig[0];
      const resources = tokenConfigElement.querySelector('.tab[data-tab="resources"]');
      const noTooltip = tokenConfig.object.getFlag(Utils.moduleName, 'noTooltip');
      const noTooltipCheckboxElement = TTAUtils.htmlToElement(`
        <div class="form-group">
            <label>No tooltip</label>
            <input type="checkbox" name="${Utils.moduleName}-no-tooltip" data-dtype="Boolean" ${noTooltip && 'checked'}>
        </div>`);
      resources.append(noTooltipCheckboxElement);

      noTooltipCheckboxElement.addEventListener('change', (ev) => {
        const isChecked = ev?.target?.checked || false;
        return tokenConfig.object.setFlag(Utils.moduleName, 'noTooltip', isChecked);
      });
    });
  },
};

function registerHandlers() {
  Object.values(hookHandlers).map((handlers) => handlers());
}

export default { registerHandlers };

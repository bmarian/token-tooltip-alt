import doMath from './lib/MathEngine.js';
import DeferredPromise from './lib/DeferredPromise.js';
import { TTAConstants } from './TTAConstants/TTAConstants.js';
import { getSetting } from './TTAFoundryApiIntegration/Settings/TTASettingsUtils.js';
import {
  clone, debug, MODULE_NAME, versionAfter10,
} from './TTAUtils/TTAUtils.js';

class Tooltip {
  constructor(
    token,
    themeClass,
    systemClass,
    fontSize,
    where,
    animType,
    animSpeed,
    path,
    template,
    gameBody,
    tooltipInfo,
  ) {
    this._reg = {
      // searches if the string is one path
      path: new RegExp(/^([\w_-]+\.)*([\w_-]+)$/),
      // searches for all the paths in a string
      paths: new RegExp(/<([\w_-]+\.)*([\w_-]+)>/g),
      // determines if the string is a number
      number: new RegExp(/^\d+$/),
      // searches for all the paths inside {}
      expressions: new RegExp(/{([^}]*)}/g),
      // determines if the string is a -
      minus: new RegExp(/-/),
      // check if it's a font awesome icon
      faIcon: new RegExp(/^[\w\- ]+$/),
      // check for text
      html: new RegExp(/^\$.+$/),
    };
    this._tooltip = null;
    this._doStringMath = doMath;
    this._accentColor = '#000000';
    this._token = token;
    this._themeClass = themeClass;
    this._systemClass = systemClass;
    this._fontSize = fontSize;
    this._where = where;
    this._animType = animType;
    this._animSpeed = animSpeed;
    this._template = template;
    this._tooltipInfo = tooltipInfo;
    this._gameBody = gameBody;
    this._moduleName = MODULE_NAME;
    this._data = path === '' ? token : this._getNestedData(this._token, path);
    this._settingsKeys = TTAConstants.SETTING_KEYS;
    this._appKeys = TTAConstants.APPS;
    this._maxRows = this._getSetting(this._settingsKeys.MAX_ROWS) || 5;
    const promise = new DeferredPromise();
    this.renderingFinished = promise.promise;
    this.renderingResolved = promise.resolve;
  }

  // get a value from Settings
  _getSetting(key) {
    return getSetting(key);
  }

  // extracts data from an object, and a string path,
  // it has no depth search limit
  _getNestedData(data, path) {
    if (!this._reg.path.test(path)) { return null; }
    const paths = path.split('.');
    if (!paths.length) { return null; }
    let res = data;
    for (let i = 0; i < paths.length; i += 1) {
      if (res === undefined) { return null; }
      res = res?.[paths[i]];
    }
    return res;
  }

  // converts a string to a number if possible
  _extractNumber(value) {
    const parsedValue = parseFloat(value);
    return Number.isNaN(parsedValue) ? null : parsedValue;
  }

  // extracts data from an operation
  _getOperationData(data, operation) {
    const t = this;
    const convOp = operation.replace(this._reg.paths, (dataPath) => {
      const dp = dataPath.substring(1, dataPath.length - 1);
      if (t._reg.number.test(dp) || t._reg.minus.test(dp)) { return dp; }
      return t._getNestedData(this._data, dp);
    });
    return this._doStringMath(convOp);
  }

  // determines how operations are processed: if is needed to _getNestedData or to _getOperationData
  _expressionHandler(data, expression) {
    const t = this;
    let hasNull = false;
    const convExp = expression.replace(this._reg.expressions, (_0, dataPath) => {
      const value = t[t._reg.path.test(dataPath) ? '_getNestedData' : '_getOperationData'](data, dataPath);
      // The explicit check is needed for values that have 0;
      if (value === null) {
        hasNull = true;
        return '';
      }
      if (typeof value === 'object') {
        const entries = value?.entries;
        return entries && entries.reduce((e, v) => `${e + v} `, '')?.slice(0, -1);
      }
      return value;
    });
    return hasNull ? null : convExp;
  }

  _evalFunction(data, funString) {
    const userFunStr = `${'const {token, data, tooltip, utils} = arguments[0];'
            + 'try {\n'}${
      funString
    }\n} catch (err) { utils.debug(err); return ""; }`;

    // eslint-disable-next-line no-new-func
    const userFun = new Function(userFunStr);
    return userFun({
      token: this._token, data, tooltip: this, utils: { debug },
    });
  }

  // checks what type of icon it is:
  // * font awesome icon
  // * url
  _getIconData(icon) {
    const trimmedText = icon.trim();
    const htmlType = icon ? this._reg.html.test(trimmedText) : false;
    const iconType = icon ? this._reg.faIcon.test(trimmedText) : true;

    return {
      icon: htmlType ? icon.substring(1) : icon,
      htmlType,
      iconType,
      iconSize: this._fontSize,
    };
  }

  // appends stats with only a value
  _appendSimpleStat(value, item, stats) {
    if (value === '' || (typeof value !== 'string' && Number.isNaN(value))) { return; }
    const v = item.isNumber ? this._extractNumber(value) : value;
    stats.push({ value: v, color: item?.color, ...this._getIconData(item?.icon) });
  }

  // appends object stats (they need to have a fixed structure)
  // {value, max} and optional {temp, tempmax}
  _appendObjectStat(values, item, stats) {
    if (
      Number.isNaN(values.value)
      || Number.isNaN(values.max)
      || values.value === null
      || values.max === null
    ) { return; }

    const temp = values.temp > 0 ? `(${values.temp})` : '';
    const tempmax = values.tempmax > 0 ? `(${values.tempmax})` : '';
    const value = `${values.value}${temp}/${values.max}${tempmax}`;
    stats.push({ value, color: item?.color, ...this._getIconData(item?.icon) });
  }

  // appends to a stats array a structure for stats
  _appendStat(item, value, stats) {
    if (!(item && value !== null && stats)) { return; }
    if (typeof value === 'object') {
      this._appendObjectStat({
        value: this._extractNumber(value.value),
        max: this._extractNumber(value.max),
        temp: this._extractNumber(value.temp),
        tempmax: this._extractNumber(value.tempmax),
      }, item, stats);
    } else {
      this._appendSimpleStat(value, item, stats);
    }
  }

  // determines if for this type of actor there is custom data, or the default should be used
  _getActorData() {
    const defaultType = this._appKeys.TOOLTIP_DEFAULT_ACTOR_ID;
    const actors = this._getSetting(this._settingsKeys.ACTORS);
    if (!actors.length) { return {}; }
    // determine the actor we are working with
    let actor = null;
    for (let i = 0; i < actors.length; i += 1) {
      const a = actors[i];
      if (a.id === this._tooltipInfo.actorType) {
        actor = a;
        break;
      }
    }
    if (!actor) { return {}; }
    // determines if we should get the data from the gms settings or from players
    const settings = this._getSetting(this._tooltipInfo.isGM ? this._settingsKeys.GM_SETTINGS : this._settingsKeys.PLAYER_SETTINGS);
    // if the actor has custom data we try to get that, if not we use the default
    return settings?.[actor.custom ? this._tooltipInfo.actorType : defaultType] || {};
  }

  // get the current actor disposition as a string (foundry has it as an enum e.g. 0 -> NEUTRAL)
  _getActorDisposition(tokenDispositions) {
    const dispositionsWithoutOwned = tokenDispositions.filter((d) => d !== this._appKeys.OWNED_DISPOSITION);
    const disposition = dispositionsWithoutOwned?.[parseInt(versionAfter10() ? this._token?.document?.disposition : this._token?.data?.disposition, 10) + 1];

    // albions-angel: fixed >= which should have been >
    // albions-angel: fix for CONST?.ENTITY_PERMISSIONS?.OBSERVER 
    // albions-angel: now changed to CONST.DOCUMENT_OWNERSHIP_LEVELS as of V10
    if (this._tooltipInfo.isGM) { return disposition; }
    return this._token?.actor?.permission > CONST?.DOCUMENT_OWNERSHIP_LEVELS?.OBSERVER ? this._appKeys.OWNED_DISPOSITION : disposition;
  }

  // This returns the itemList for a given disposition
  _getItemListForDisposition(items, disposition) {
    for (let i = 0; i < items?.length; i += 1) {
      const item = items[i];
      if (item.disposition === disposition) { return item.items; }
    }
    return [];
  }

  // Determines if the tooltip should have the name shown, for the GM this is a simple yes or no answer
  // for players this gets a little complicated
  _getActorDisplayName(staticData) {
    if (!staticData) return null;
    const tokenDataSource = versionAfter10() ? this._token : this._token?.data;
    const tokenName = tokenDataSource?.name;
    if (this._tooltipInfo.isGM && staticData.displayNameInTooltip) return tokenName;
    if (!this._tooltipInfo.isGM) {
      // here I do some logic that I don't really like but I can't find a good way of doing it

      // adding a +1 because the numbers start from -1 (hostile)
      const tokenDisposition = parseInt(tokenDataSource?.disposition, 10) + 1;
      const index = staticData?.tokenDispositions?.indexOf(staticData.displayNameInTooltip);
      // Fix for NONE and OWNED
      // albions-angel: fix for CONST?.ENTITY_PERMISSIONS?.OBSERVER
      // albions-angel: now changed to CONST.DOCUMENT_OWNERSHIP_LEVELS as of V10
      if (index === -1) {
        if (staticData.displayNameInTooltip === this._appKeys.NONE_DISPOSITION) return null;
        return staticData.displayNameInTooltip === this._appKeys.OWNED_DISPOSITION
                    && this._token?.actor?.permission >= CONST?.DOCUMENT_OWNERSHIP_LEVELS?.OBSERVER ? tokenName : null;
      }
      // Example: ['HOSTILE', 'NEUTRAL', 'FRIENDLY'] <=> [-1, 0, 1]
      // tokenDisposition = -1 + 1 (0) <=> HOSTILE
      // index = indexOf('FRIENDLY') <=> 2
      // In this case we don't want to show the name so: index > tokenDisposition => NO NAME
      if (index <= tokenDisposition) { return tokenName; }
    }
    return null;
  }

  // generates an array of stats that should be displayed
  _getTooltipData() {
    const data = this._getActorData();
    if (!data) { return { stats: [] }; }
    const stats = [];
    const staticData = {
      ...data.static,
      // This is needed to not modify the original object, and also to reverse it only once here
      tokenDispositions: data?.static?.tokenDispositions ? clone(data?.static?.tokenDispositions)?.reverse() : [],
    };
    const itemList = this._getItemListForDisposition(data.items, this._getActorDisposition(staticData?.tokenDispositions));
    if (!staticData || !itemList.length) { return { stats: [] }; }
    for (let i = 0; i < itemList.length; i += 1) {
      const item = itemList[i];
      const value = item?.isFunction
        ? this._evalFunction(this._data, item.value)
        : this[item?.expression ? '_expressionHandler' : '_getNestedData'](this._data, item.value);
      if (staticData.useAccentEverywhere) { item.color = staticData.accentColor; }
      this._appendStat(item, value, stats);
    }
    const tokenName = this._getActorDisplayName(staticData);
    // FIXME: this should not be here I think, but I am sleep deprived and running on beer so what do I know
    this._accentColor = staticData.accentColor;
    debug({ tokenName, data: this._data });
    return { moduleName: this._moduleName, stats, tokenName };
  }

  // break the rows into columns
  _breakInColumns(stats) {
    if (stats.length <= this._maxRows) { return [stats]; }
    const colStats = [];
    for (let i = 0; i < stats.length; i += this._maxRows) {
      colStats.push(stats.slice(i, i + this._maxRows));
    }
    return colStats;
  }

  // determines what should be shown in the tooltip
  async _buildTooltipContent() {
    const data = this._getTooltipData();
    if (!data.stats.length) { return null; }
    const columns = this._breakInColumns(data.stats);
    const templateData = {
      ...data,
      stats: columns,
      numberOfColumns: columns.length,
    };
    debug(templateData);
    return renderTemplate(this._template, templateData);
  }

  // populates the tooltip container with the build content, and returns if the tooltip has content
  // should only be called by _createTooltip()
  async _populateContainer() {
    const content = await this._buildTooltipContent();
    if (content && this._tooltip) { this._tooltip.html(content); }
    return !!content;
  }

  // creates the tooltip's container
  // should only be called by _createTooltip()
  _createContainer() {
    this._tooltip = $(`<div class="${this._moduleName}-tooltip-container ${this._systemClass} ${this._themeClass}"></div>`);
    this._tooltip.css({ fontSize: `${this._fontSize}rem` });
  }

  // appends the tooltip's container to the body
  // should only be called by _createTooltip()
  _appendContainerToBody() {
    this._gameBody.append(this._tooltip);
  }

  // returns the coordinates for the tooltip position
  // should only be called by _positionTooltip()
  _getTooltipPosition() {
    const tokenWT = this._token.worldTransform;
    const padding = 5;
    const ltPadding = 20; // padding for left and top positioning
    const position = {
      // Fix for #102 and #93: Token Z changes the token z index to be negative, so
      // we need to clip it to 0
      zIndex: Math.max(this._token.zIndex, 0),
      color: this._accentColor,
    };
    switch (this._where) {
      case 'right':
      default: {
        position.top = tokenWT.ty - padding;
        position.left = tokenWT.tx + (this._token.w * tokenWT.a) + padding;
        break;
      }
      case 'bottom': {
        position.top = tokenWT.ty + (this._token.h * tokenWT.a) + padding;
        position.left = tokenWT.tx - padding;
        break;
      }
      case 'left': {
        const cW = this._tooltip.width();
        position.top = tokenWT.ty - padding;
        position.left = tokenWT.tx - cW - ltPadding;
        break;
      }
      case 'top': {
        const cH = this._tooltip.height();
        position.top = tokenWT.ty - cH - ltPadding;
        position.left = tokenWT.tx - padding;
        break;
      }
      case 'overlay': {
        position.top = tokenWT.ty - padding;
        position.left = tokenWT.tx - padding;
        break;
      }
      case 'isometric': {
        const cW = this._tooltip.width();
        position.top = tokenWT.ty;
        position.left = tokenWT.tx - cW;
        position.transform = 'rotateX(54deg) rotateY(-2deg) rotateZ(-44deg)';
        break;
      }
      case 'doubleSurprise': {
        const canvas = $('#board');
        const w = canvas.width() - this._tooltip.width();
        const h = canvas.height() - this._tooltip.height();
        position.top = Math.floor(Math.random() * h);
        position.left = Math.floor(Math.random() * w);
        break;
      }
    }
    return position;
  }

  // positions the newly created tooltip
  // should only be called by _createTooltip()
  _positionTooltip() {
    if (!this._tooltip) { return; }
    const position = this._getTooltipPosition();
    this._tooltip.css(position);
  }

  // creates a tooltip, and only displays it if it has content
  async _createTooltip() {
    this._createContainer();
    const hasContent = await this._populateContainer();
    if (!hasContent) { return; }
    this._appendContainerToBody();
    this._positionTooltip();
  }

  // will first remove the tooltip from the DOM, then make the reference null
  _destroyTooltip() {
    if (!this._tooltip) { return; }
    this._tooltip.remove();
    this._tooltip = null;
  }

  // get the assigned token's id
  getTokenId() {
    return this._token?.id;
  }

  // the name is a bit misleading, this will attempt to create the tooltip,
  // then play an animation to show it
  show() {
    const t = this;
    const animationCompleteCb = () => t.renderingResolved(t._tooltip);
    this._createTooltip().then(() => {
      switch (t._animType) {
        case 'fade': {
          t._tooltip.css({ opacity: 0 });
          t._tooltip.animate({ opacity: 1 }, this._animSpeed, animationCompleteCb);
          break;
        }
        default: {
          animationCompleteCb();
          break;
        }
      }
    });
  }

  // the name is a bit misleading, this will attempt to play an animation,
  // then destroy the tooltip
  hide() {
    switch (this._animType) {
      case 'fade': {
        this._tooltip.animate({ opacity: 0 }, this._animSpeed, this._destroyTooltip);
        break;
      }
      case 'none':
      default: {
        this._destroyTooltip();
        break;
      }
    }
  }
}
export default Tooltip;

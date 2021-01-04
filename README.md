# Token Tooltip Alt
![GitHub Latest Release](https://img.shields.io/github/release/bmarian/token-tooltip-alt?style=for-the-badge)
![Downloads](https://img.shields.io/github/downloads/bmarian/token-tooltip-alt/total?style=for-the-badge)
![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Ftoken-tooltip-alt&colorB=4aa94a&style=for-the-badge)

A module that adds a fully customizable tooltip next to the currently hovered token to show some useful information for players and DMs.
You can also hold ALT to see the tooltips for all tokens on the map.

# Installation
- Go in the `Add-on Modules` section
- Click `Install Module`
- And search for Token Tooltip Alt

# How to use

## Game settings

![game-settings](https://i.imgur.com/oGUegIm.png)

- `Tooltip placement`: Self-descriptive, chose where the tooltip should be shown. **(Configurable by players)**
- `Font size`: You can change the font size to a value between 1 - 2.5 rem. **(Configurable by players)**
- `Max rows`: Determins how many rows should be in a column. **(Configurable by players)**
- `Data source`: This is an advanced feature, with this you chose how deep into the token object the search for values start.
- `Show all tooltips on ALT`: If true, when pressing ALT you will see a tooltip for every visible token on the scene.
- `Dark theme`: If true, will show the tooltips with a dark theme. **(Configurable by players)**
- `Show on <ALT>`: If true, when pressing ALT \*every visible token on the screen will display a tooltip.
- `Show all on <ALT>`: If true, when pressing ALT \*every token on the screen will display a tooltip.
- `Isometric tooltips`: If true, and you are on an isometric map it will position the tooltip in front of the token with an isometric perspective.
- `Debug output`: If true, will display some useful debugging information in the console.

## Token configuration

![token-config](https://i.imgur.com/yyoHdEb.png)

An option is available in the `Resources` tab of the token configuration. `No tooltip`, if true that specific token will not display a tooltip.

## Tooltip manager

![tooltip-manager](https://i.imgur.com/VVcf4PF.png)

This section displays all the available actor types, from here you can decide if they should display a tooltip, by checking the enable checkbox. 

If the custom checkbox is not checked, the actor type will use the **default settings**.

Here you can also **import**/**export** settings for **Tooltip editor**.

## Tooltip editor

![tooltip-editor](https://i.imgur.com/Up0w5GQ.png)

This section is divided into two. The settings for the GM, and the settings for the PLAYER, so you could have full control over what players see versus what the gm sees.

### Settings
- `Display name`:
	- GM: If true, will display the name of the token in the tooltip.
	- PLAYER: You can choose which token will display the name based on the disposition. (e.g. if set to NEUTRAL -> FRIENDLY and NEUTRAL tokens will display tooltips)
- `Use accent color everywhere`: If true, instead of the colores set for every icon, the accent color will be used.
- `Accent color`:  The border and title color.

### Tables
You can have a different configuration for every token disposition.

- `Color`: Allows you to change the color for this item's icon.
- `Icon`: You can use any url/path to an icon, or any icon from [Font Awesome](https://fontawesome.com/icons?d=gallery) (e.g. the icon is called heart you have to write it as fa-heart).
- `Value`: can be found double right-clicking on a token -> resources tab -> go through the attributes possible for bars, you can use anything from there.
- `Fun`: Marks the item as a JavaScript function (e.g. [FUN_EXPEXAMPLES.md](./FUN_EXPEXAMPLES.md)), here is how the function will look:
```js
/**
 * @param {Token} token - the currently hovered token
 * @param {*} data - the same data available for every line
 * @param {Tooltip} context - the tooltip from where this function is executed
 * @param {Utils} utils - my Utils class, used mostly for debugging
 * @return {string}
 */
function anonymous(token, data, context, utils) {
	try {
		/* your code will be here */
	} catch (err) {
		utils.debug(err);
		return '';
	}
}
```
- `Exp`: Marks the item as an expression. The engine behind this is [Math.js](https://mathjs.org/docs/expressions/index.html), please read the documentation to see what you can do with it. (e.g. [EXP_EXPEXAMPLES.md](./EXP_EXPEXAMPLES.md))
- `Nr`: Forces only the number from a string to be shown. (e.g. dnd5e: `attributes.speed.value` -> 30 ft. but you want to show only 30, this option will help with that)

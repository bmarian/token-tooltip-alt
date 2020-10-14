# Token Tooltip Alt
![License](https://img.shields.io/github/license/bmarian/token-tooltip-alt?style=for-the-badge)
![GitHub Latest Release](https://img.shields.io/github/release/bmarian/token-tooltip-alt?style=for-the-badge)
![Foundry Version](https://img.shields.io/badge/FoundryVTT-0.7.3-blueviolet?style=for-the-badge)

A module that adds a fully customizable tooltip next to the currently hovered token to show some useful information for players and DMs.
You can also hold ALT to see the tooltips for all tokens on the map.

# Installation
- Go in the `Add-on Modules` section
- Click `Install Module`
- And search for Token Tooltip Alt

Manual Install: https://raw.githubusercontent.com/bmarian/token-tooltip-alt/master/src/module.json

# How to use
A few options are available for this module
- `Tooltip visibility` :

`Gm only` - only the GM will see tooltips

`Owned tokens` - the players will see tooltips for the tokens they own

`Friendly tokens` - the players will see tooltips for all the tokens they own and all the tokens that are marked as friendly

`All tokens` - the players will see tooltips for all the tokens they own, all the friendly tokens, and the first 2 fields for the hostile tokens

- `Show all tooltips on ALT`: If true, when pressing ALT you will see a tooltip for every visible token on the scene
- `Show tooltips for hidden tokens on ALT`: If this is true you when pressing alt you will see tooltips for all tokens on the scene
- `Display token name`: Display the token name in the tooltip
- `Debug output`: Gives you some debug output in the console, might be useful when hovering over a token to see the structure of the data object  
- `Font size`: You can change the font size to anything you want (e.g. 1.2rem/15px)
- `Tooltip editor`: You can customize what you see in the tooltip there

#### Friendly/Hostile tokens
`Color` - Allows you to change the color for every icon, if nothing is set it will default to black (`#000000`) 

`Value` - can be found double right-clicking on a token -> resources tab -> go through the attributes possible for bars, you can use anything from there

`Icon` - You can use any icon from [Font Awesome](https://fontawesome.com/icons?d=gallery) (this is the icon db used by Foundry), so just get any icon name from their website and add 'fa-' in front (e.g. the icon is called heart so fa-heart)

`Exp` - Marks if the row has an expression. You can write anything in a custom expression, the only thing that matters is to have the attributes you want to show inside `{}` (e.g. `{attributes.hp}`)

`Nr` - Forces only the number from a string to be shown (e.g. dnd5e: `{attributes.speed.value}` -> 30 ft. but you want to show only 30, this option will help with that)

#### Hostile tokens 
This is what players would see for hostile tokens if your Tooltip visibility is set to All tokens

#### Display token name
Display the token name in the tooltip 

#### Use accent color everywhere
If set to true the tooltip will only use the accent color for everything

#### Font size
You can change the font size to anything you want (e.g. 1.2rem/15px)

#### Accent color
Set an accent color, used for the border

![custom](https://i.imgur.com/clVu89L.png)

# Examples

#### Getting what you want from the data
There are two ways:
- The _I don't like the console_ method, where you double right-clicking on a token -> resources tab -> and go through the attributes and chose what you want

![token-config](https://i.imgur.com/c0h1bOY.png)

- And the _I like me some console_, where you enable the `Debug output` option, and every time you hover over a token you will get the object from where I pull data

![console-config](https://i.imgur.com/Vi6rFkn.png)

#### You want to only show a value, not the entire string
Just check the `Nr` checkbox, this will try to pull out a number from the string

![professional-underlines](https://i.imgur.com/mEL6G9a.png)

#### Show custom formulas
Let's say you don't want to show your players the actual hp of a monster, but you still want to show them how much dmg they've done, 
you can use a formula `{attributes.hp.max - attributes.hp.value}`

![broken-heart](https://i.imgur.com/oTu8Tga.png)

This uses [string-math](https://github.com/devrafalko/string-math) so whatever works there should work here.

#### Can I have multiple formulas?
Of course! Use as many as you like, go wild!

![multiple-formulas](https://i.imgur.com/I26dsGs.png)

#### Make a different tooltip for the enemies

![enemy](https://i.imgur.com/MGHA6UZ.png)

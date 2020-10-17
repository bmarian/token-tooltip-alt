# v0.0.1
- [x] Implement what was already in [token-tooltip](https://github.com/Sky-Captain-13/foundry/tree/master/token-tooltip)
- [x] Border and icon colors should be the same as user color
- [x] Observable actors should now display a full tooltip
- [x] Fixed some bugs present in the original token-tooltip: (tooltip remaining on the screen on panning/zooming/moving a token)
- [x] Using alt to show all stats 
- [x] Hide stats when they return `null`

# v0.1.0
- [x] Configurable stats

# v0.1.1
- [x] Fixed the empty tooltip showing for tokens you don't own

# v0.1.2
- [x] Add an option to display the token name in the tooltip
- [ ] ~~Removed the need to specify `fa-` before the icon name (not doing it)~~

# v0.2.0
- [x] Expression convertor
- [x] Debugging options
- [x] Quick and dirty fix for this to work with Health Estimate

# v0.3.0
- [x] Themes support
- [x] Smaller default fonts
- [x] Presets support
- [x] Allow user to force number (use case: weird movement speeds)
- [x] Allow users to change colors
- [x] Allow users to change font sizes

# v0.3.1
- [x] Allow simple math calculations
- [x] Updated the documentation


# v0.3.2
### Features
- [x] Accent color-picker
- [x] Moved all the settings related to the look and feel of the tooltip inside the Tooltip editor
- [x] Separate list for enemy player view

### Bugs
- [x] Fixed the width of the tooltip extending indefinitely
- [x] Fixed 0 getting ignored if number was forced
- [x] Fixed the tooltips remaining sticky on ALT + TAB

# v0.3.3
- [x] Fixed the download link

# v0.3.4
### Features
- [x] Open the tooltip wherever you want. (closes #1)
- [x] Hide if some value is equal to some given value
- [x] Dark theme
- [x] Don't show for a specific value

### Bugs
- [x] Fixed the positioning of the tooltip
- [x] Fix the empty tooltip if nothing should be displayed inside

# v0.3.5
### Features
- [x] Added a preset for cyphersystem

### Bugs
- [x] Fixed the object logic for detecting if something is null (closes #3)
- [x] Fixed the leaf elements not caught by the `strictpathexp` (closes #4)

# v0.3.6
- [x] Added a data source option (closes #6)

# v0.3.7
- [x] Don't display the entire formula if an element is wrong (closes #8)

# v1.0.0
### Features
- [ ] A rewrite to make it easier for later enhancements
- [x] Animation bases

### Bugs
- [x] Fixed the <TAB> functionality

# Backlog
### Features
- [ ] Presets for other systems
- [ ] Popup delay

### Bugs
- [ ] Spamming hover while ALT is pressed keeps the tooltips stiky until you hover again or press ALT again

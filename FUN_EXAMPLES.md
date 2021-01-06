# Function examples
A collection of examples made by me or others that might give you an idea of how to use javascript to make something awesome for your games.

# dnd5e

### Show confetti if the enemy is dead

For this one, you need the [foundryvtt-confetti](https://github.com/ElfFriend-DnD/foundryvtt-confetti) module.

```js
// check if the enamy is dead
const hp = data.attributes?.hp?.value;
if (hp > 0) return '';

// check if we already triggered confetti
window.TTAPlayerHostileConfettiRunning = window.TTAPlayerHostileConfettiRunning || false;
if (window.TTAPlayerHostileConfettiRunning) return '';

// this uses the foundryvtt-confetti module
const confetti = () => {
  const confettiInst = window.confetti;
  if (!confettiInst) return '';
  
  const strength = confettiInst.confettiStrength.med;
  const props = confettiInst.getShootConfettiProps(strength);
  confettiInst.handleShootConfetti(props);
}
confetti();

// mark that we used confetti
window.TTAPlayerHostileConfettiRunning = true;

// add a time to reset the confetti limit after 3s
setTimeout(() => {
  window.TTAPlayerHostileConfettiRunning = false;
}, 3000);

return '';
```

![](https://i.imgur.com/QlTmTEv.gif)

### Showing all the speed values in a single item
```js
const movs = JSON.parse(JSON.stringify(data.attributes.movement));
delete movs.hover;
delete movs.units;

return Object.entries(movs).reduce((acc, [key, value]) => {
  return acc + value !== 0 ? `${key[0].toUpperCase()}:${value}` : '';
}, '');
```

![](https://i.imgur.com/pzTQcIr.png)

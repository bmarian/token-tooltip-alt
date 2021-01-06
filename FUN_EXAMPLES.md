# Function examples
A collection of examples made by me or others that might give you an idea of how to use javascript to make something awesome for your games.

# dnd5e

### Running code after the tooltip is rendered

```js
tooltip.renderingFinished.then(($html) => {
    /* YOUR CODE HERE */
});

return '';
```

### Show [confetti](https://github.com/ElfFriend-DnD/foundryvtt-confetti) if the enemy is dead

```js
// check if the enamy is dead
const hp = data.attributes.hp.value;
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

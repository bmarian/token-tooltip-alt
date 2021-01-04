# Function examples
A collection of examples made by me or others that might give you an idea of how to use javascript to make something awesome for your games.

# dnd5e

### Show confetti if the enemy is dead

For this one, you need the [foundryvtt-confetti](https://github.com/ElfFriend-DnD/foundryvtt-confetti) module.

```js
window.TTASpamLimit = window.TTASpamLimit || '';
const confetti = window?.confetti;
const dead = data.attributes.hp.value === 0;
const spam = window.TTASpamLimit === token.data.actorId;
if (dead && confetti && !spam) {
confetti.shootConfetti(confetti.getShootConfettiProps(1));
window.TTASpamLimit = token.data.actorId;
}
return '';
```

![](https://i.imgur.com/GPCQfOz.gif)

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

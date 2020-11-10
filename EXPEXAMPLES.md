# Expressions examples
A collection of examples made by me or others that might give you an idea of how to use mathjs to make something awesome for your games.

# dnd5e

### Showing all the speed values in a single item

```
{ 
h=<attributes.movement.hover>;
h=compareText(typeOf(h), "null") == 0 ? "" : h ? "H " : "";
u=<attributes.movement.units>;
u=compareText(typeOf(u), "null") == 0 ? '' : u;
w=<attributes.movement.walk>;
w=compareText(typeOf(w), "null") == 0 ? '' : w > 0 ? concat("W:", string(w), " ") : "";
f=<attributes.movement.fly>;
f=compareText(typeOf(f), "null") == 0 ? '' : f > 0 ? concat("F:", string(f), " ") : "";
s=<attributes.movement.swim>;
s=compareText(typeOf(s), "null") == 0 ? '' : s > 0 ? concat("S:", string(s), " ") : "";
c=<attributes.movement.climb>;
c=compareText(typeOf(c), "null") == 0 ? '' : c > 0 ? concat("C:", string(c), " ") : "";
b=<attributes.movement.burrow>; 
b=compareText(typeOf(b), "null") == 0 ? '' : b > 0 ? concat("B:", string(b), " ") : "";
concat(h, w, f, s, c, b) 
}
```

![](https://i.imgur.com/pzTQcIr.png)

### Showing the HP and TEMPHP combined

```
{
hp=<attributes.hp.value>;
hpm=<attributes.hp.max>;
hpt=<attributes.hp.temp>;
hptm=<attributes.hp.tempmax>;
hpt=compareText(typeOf(hpt), "null") == 0 ? 0 : hpt;
hptm=compareText(typeOf(hptm), "null") == 0 ? 0 : hptm;
concat(string(hp + hpt), "/", string(hpm + hptm))
}
```

![](https://i.imgur.com/0jSOgcA.png)

### Show an HP estimate for players

```
{
hp=<attributes.hp.value>;
hpm=<attributes.hp.max>;
hp <= 0 ? "Dead" : hp == 1 & hpm > 2 ? "Are you kidding me?" : hp < hpm/2 ? "Wounded" : "Healthy"
}
```

![](https://i.imgur.com/uwAGn3n.png)
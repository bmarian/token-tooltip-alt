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


### Show remaining spell slots

```
{ 
s1 = <spells.spell1.value>;
s2 = <spells.spell2.value>;
s3 = <spells.spell3.value>;
s4 = <spells.spell4.value>;
s5 = <spells.spell5.value>;
s6 = <spells.spell6.value>;
s7 = <spells.spell7.value>;
s8 = <spells.spell8.value>;
s9 = <spells.spell9.value>;

s1 = s1 > 0 ? concat('[1:', string(s1), ']') : '';
s2 = s2 > 0 ? concat(' [2:', string(s2), ']') : '';
s3 = s3 > 0 ? concat(' [3:', string(s3), ']') : '';
s4 = s4 > 0 ? concat(' [4:', string(s4), ']') : '';
s5 = s5 > 0 ? concat(' [5:', string(s5), ']') : '';
s6 = s6 > 0 ? concat(' [6:', string(s6), ']') : '';
s7 = s7 > 0 ? concat(' [7:', string(s7), ']') : '';
s8 = s8 > 0 ? concat(' [8:', string(s8), ']') : '';
s9 = s9 > 0 ? concat(' [9:', string(s9), ']') : '';

concat(s1, s2, s3, s4, s5, s6, s7, s8, s9)
}
```

![](https://i.imgur.com/tXdbPpL.png)

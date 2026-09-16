# Native Ridgeside Village architecture

The farmhouse, small seed shop, shipping box and well use actual native-resolution architecture from **Ridgeside Village**, by **Rafseazz and the Ridgeside Village graphics contributors**. The full upstream credits and license statement ship beside the crops in `public/assets/ridgeside-buildings/`.

Source: [spring_zridgesidebuildings.png](https://github.com/Rafseazz/Ridgeside-Village-Mod/blob/1f3bf6d73039d4b7bec7c9d70a0a1e7ea971f6b9/Ridgeside%20Development/%5BCP%5D%20Ridgeside%20Village/Assets/Maps/TileSheets/spring_zridgesidebuildings.png), fixed revision `1f3bf6d73039d4b7bec7c9d70a0a1e7ea971f6b9`.

Upstream README licenses all directories outside its SMAPI Component under **CC BY-SA 4.0**. These map graphics are outside SMAPI. The selected crops and their adaptations retain that license, https://creativecommons.org/licenses/by-sa/4.0/. The MIT code license is not presented as the artwork's license. The mod/game creators do not endorse Clover Hollow.

| Sprite | Source rectangle (x,y,width,height) | Drawing anchor |
| --- | --- | --- |
| Farmhouse | 208,272,192,144 | 136,140 |
| Seed shop | 480,304,80,112 | 40,102 |
| Well | 0,416,48,80 | 24,79 |
| Shipping box | 192,448,32,32 | 16,31 |

Adaptations are transparent cropping and removing the well’s semi-transparent rectangular backing (alpha 89 and 163), which otherwise leaves a visible box over the ground. Opaque source pixels and colors remain unchanged and render one source pixel per world pixel before integer display zoom. Exact source and output SHA-256 hashes are in `provenance.json`. This replaces the softer MourningStar preview-derived buildings, whose historical files and attribution remain preserved.

// @ts-check
// TEMPORARY placeholder, replaced by the real animation.
/** @type {import('../../js/anim/kit.js').Composition} */
export default {
  duration: 6,
  poster: 2,
  base: import.meta.url,
  assets: {},
  strings: { en: { title: 'p5.anims' }, zh: { title: 'p5.anims 占位' } },
  build(k) {
    const s = k.scene(k.C.cream);
    const tiles = k.tiles(s, k.t('title'), { x: 1000, y: 500, size: 120 });
    k.slap(tiles, 0.3);
    const tag = k.tag(s, 'placeholder', { x: 1000, y: 700 });
    k.pop(tag, 1.5);
    k.sway(tag, 1.5, 4.5);
  },
};

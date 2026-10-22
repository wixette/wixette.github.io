// @ts-check
// The showcases, in the order the page shows them. To add one, follow
// docs/adding-a-showcase.md.

/** @typedef {import('../js/layout.js').Emphasis} Emphasis */
/** @typedef {import('../js/anim/kit.js').Composition} Composition */
/** @typedef {{ en: string; zh: string }} Text */

/**
 * @typedef {object} Showcase
 * @property {string} id the repository's name in lower case; also the folder under showcases/
 * @property {string} repo the GitHub repository
 * @property {{ en: string; zh: string } | null} demo the live demo, if any, in each language
 * @property {Emphasis} emphasis heroes are shown larger than the others
 * @property {string} accent the tile's colour
 * @property {Text} title
 * @property {Text} tagline
 * @property {string[]} tags short, the same in both languages
 * @property {() => Promise<{ default: Composition }>} composition
 */

/** @type {Showcase[]} */
export const SHOWCASES = [
  {
    id: '8800-simulator',
    repo: 'https://github.com/wixette/8800-simulator',
    demo: { en: 'https://wixette.github.io/8800-simulator/', zh: 'https://wixette.github.io/8800-simulator/' },
    emphasis: 'hero',
    accent: '#4d8dff',
    title: { en: 'Altair 8800 Simulator', zh: 'Altair 8800 模拟器' },
    tagline: { en: 'The 1975 computer that started it all, in your browser', zh: '开启个人电脑时代的机器，在浏览器里' },
    tags: ['8080', 'BASIC', 'Web'],
    composition: () => import('./8800-simulator/composition.js'),
  },
  {
    id: 'leibniz-stepped-reckoner',
    repo: 'https://github.com/wixette/leibniz-stepped-reckoner',
    demo: { en: 'https://wixette.github.io/leibniz-stepped-reckoner/', zh: 'https://wixette.github.io/leibniz-stepped-reckoner/' },
    emphasis: 'hero',
    accent: '#ffb547',
    title: { en: "Leibniz's Stepped Reckoner", zh: '莱布尼茨步进计算器' },
    tagline: { en: 'The first machine for all four sums, in working 3D', zh: '第一台四则运算机器，可以动手转的 3D 模型' },
    tags: ['3D', 'History', 'Web'],
    composition: () => import('./leibniz-stepped-reckoner/composition.js'),
  },
  {
    id: 'huashuo',
    repo: 'https://github.com/wixette/huashuo',
    demo: null,
    emphasis: 'normal',
    accent: '#2ee6a8',
    title: { en: 'Huashuo', zh: '话说' },
    tagline: { en: 'Multi-voice audiobooks, made on your Mac', zh: '在你的 Mac 上做多角色有声书' },
    tags: ['TTS', 'LLM', 'macOS'],
    composition: () => import('./huashuo/composition.js'),
  },
  {
    id: 'meowlang',
    repo: 'https://github.com/wixette/meowlang',
    demo: { en: 'https://wixette.github.io/meowlang/', zh: 'https://wixette.github.io/meowlang/index.zh.html' },
    emphasis: 'normal',
    accent: '#b388ff',
    title: { en: 'Meowlang', zh: '喵语言' },
    tagline: { en: 'An esoteric programming language for cats', zh: '一门写给猫的编程语言' },
    tags: ['Esolang', 'Web'],
    composition: () => import('./meowlang/composition.js'),
  },
  {
    id: 'p5.anims',
    repo: 'https://github.com/wixette/p5.animS',
    demo: { en: 'https://wixette.github.io/p5.animS/', zh: 'https://wixette.github.io/p5.animS/' },
    emphasis: 'normal',
    accent: '#ff4f8b',
    title: { en: 'p5.animS', zh: 'p5.animS' },
    tagline: { en: 'Watch p5.js shapes draw themselves', zh: '让 p5.js 图形一笔一笔画出来' },
    tags: ['p5.js', 'Library'],
    composition: () => import('./p5.anims/composition.js'),
  },
];

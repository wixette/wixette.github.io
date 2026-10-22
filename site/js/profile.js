// @ts-check
// The About dialog's content, in one place.

/** @typedef {{ en: string; zh: string }} Text */
/** @typedef {{ label: Text; href: string; icon: string }} Link */

export const PROFILE = {
  /** The name's lines in each language; the whole name takes the same height in both. */
  name: { en: ['Yonggang', 'Wang'], zh: ['王咏刚'] },
  handle: '@wixette',
  /** relative to site/; the logo stands in for an avatar */
  avatar: 'images/logo.svg',
  bio: {
    en: 'Programmer, ex-Googler, the same age as the Homebrew Computer Club. Wrote novels, made investments, started company after company. Loves open-source projects that are fun, and would rather not live without curiosity.',
    zh: '程序员，ex-Googler，与 Homebrew Computer Club 同年，写过小说，做过投资，当过连续创业者，钟爱好玩的开源项目，离了好奇心就不想活',
  },
  /** @type {Link[]} */
  links: [
    { label: { en: 'Blog', zh: '博客' }, href: 'https://www.ygwang.info/', icon: 'language' },
    { label: { en: 'GitHub', zh: 'GitHub' }, href: 'https://github.com/wixette', icon: 'github' },
    { label: { en: 'X', zh: 'X' }, href: 'https://x.com/wixette', icon: 'x' },
    { label: { en: 'LinkedIn', zh: 'LinkedIn' }, href: 'https://www.linkedin.com/in/wixette/', icon: 'linkedin' },
    { label: { en: 'Zhihu', zh: '知乎' }, href: 'https://www.zhihu.com/people/ygwang', icon: 'zhihu' },
  ],
};

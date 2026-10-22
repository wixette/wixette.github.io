// @ts-check
// The About dialog's content, in one place. PLACEHOLDERS until the owner provides the real
// ones: set `placeholder` to false on each item once it is real.

/** @typedef {{ en: string; zh: string }} Text */
/** @typedef {{ label: Text; href: string; icon: string; placeholder: boolean }} Link */

export const PROFILE = {
  name: { en: 'Yonggang Wang', zh: 'Yonggang Wang' },
  handle: '@wixette',
  /** relative to site/ */
  avatar: 'images/avatar.svg',
  /** paragraphs */
  bio: {
    en: [
      'Software engineer who likes old machines, small languages and making things move.',
      'This is placeholder text: a few lines about who I am and what I work on go here.',
    ],
    zh: ['喜欢老机器、小语言和让东西动起来的软件工程师。', '这是占位文字：这里写几句关于我是谁、在做什么。'],
  },
  placeholder: true,
  /** @type {Link[]} */
  links: [
    { label: { en: 'GitHub', zh: 'GitHub' }, href: 'https://github.com/wixette', icon: 'code', placeholder: false },
    { label: { en: 'Email', zh: '邮箱' }, href: '', icon: 'mail', placeholder: true },
    { label: { en: 'Website', zh: '网站' }, href: '', icon: 'link', placeholder: true },
  ],
};

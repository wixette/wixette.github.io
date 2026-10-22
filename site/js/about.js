// @ts-check
// The About dialog: a native <dialog> (focus trap, Escape, focus return), filled from
// profile.js in the current language.

import { assetUrl } from './asset-url.js';
import { icon } from './icons.js';
import { lang, onLang, t } from './i18n.js';
import { PROFILE } from './profile.js';

/**
 * @param {HTMLDialogElement} dialog
 * @param {HTMLButtonElement} opener
 */
export function initAbout(dialog, opener) {
  const body = document.createElement('div');
  body.className = 'about-body';
  dialog.append(body);

  const render = () => {
    const l = lang();
    dialog.setAttribute('aria-label', t('about.open'));
    body.replaceChildren();

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'icon-btn about-close';
    close.setAttribute('aria-label', t('about.close'));
    close.append(icon('close'));
    close.addEventListener('click', () => dialog.close());

    const head = document.createElement('div');
    head.className = 'about-head';
    const avatar = document.createElement('img');
    avatar.className = 'avatar';
    avatar.src = assetUrl(PROFILE.avatar);
    avatar.alt = '';
    avatar.draggable = false;
    const who = document.createElement('div');
    // The name's lines share one fixed height: two in English, one in Chinese.
    const name = document.createElement('h2');
    name.className = `name lines-${PROFILE.name[l].length}`;
    for (const line of PROFILE.name[l]) {
      const span = document.createElement('span');
      span.textContent = line;
      name.append(span);
    }
    const handle = document.createElement('p');
    handle.className = 'handle';
    handle.textContent = PROFILE.handle;
    who.append(name, handle);
    head.append(avatar, who);

    const bio = document.createElement('p');
    bio.className = 'about-bio';
    bio.textContent = PROFILE.bio[l];

    const title = document.createElement('p');
    title.className = 'about-links-title';
    title.textContent = t('about.links');
    const links = document.createElement('ul');
    links.className = 'about-links';
    for (const link of PROFILE.links) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'link-chip';
      a.href = link.href;
      a.target = '_blank';
      a.rel = 'noopener me';
      a.draggable = false;
      a.append(icon(link.icon, 20), document.createTextNode(link.label[l]));
      li.append(a);
      links.append(li);
    }

    body.append(close, head, bio, title, links);
  };

  opener.addEventListener('click', () => dialog.showModal());
  // A click on the backdrop closes it: one that both starts and ends there. A drag that
  // starts in the dialog (selecting its text) and ends on the backdrop, or the other way
  // round, also lands its click on the dialog element, and must not close it; nor must a
  // click on the dialog's own border or scroll bar, which the dialog element receives too.
  /** @param {MouseEvent} e */
  const onBackdrop = (e) => {
    if (e.target !== dialog) return false;
    const r = dialog.getBoundingClientRect();
    return e.clientX < r.left || e.clientX >= r.right || e.clientY < r.top || e.clientY >= r.bottom;
  };
  let pressedBackdrop = false;
  dialog.addEventListener('pointerdown', (e) => {
    pressedBackdrop = e.isPrimary && onBackdrop(e);
  });
  dialog.addEventListener('click', (e) => {
    if (pressedBackdrop && onBackdrop(e)) dialog.close();
    pressedBackdrop = false;
  });
  onLang(render);
  render();
}

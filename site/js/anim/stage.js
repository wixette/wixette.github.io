// @ts-check
// The 2000 × 1000 stage, scaled to cover its box (design D11): a 2:1 box shows all of it, a
// square box the middle 1000 × 1000, the safe square every composition keeps its story in.

export const STAGE_W = 2000;
export const STAGE_H = 1000;
/** The safe square: everything that matters stays between these x. */
export const SAFE_LEFT = 500;
export const SAFE_RIGHT = 1500;

export class Stage {
  /** @param {HTMLElement} view the box the stage fills; it should clip its contents */
  constructor(view) {
    this.view = view;
    this.el = document.createElement('div');
    this.el.className = 'stage';
    view.append(this.el);
    this.fit();
    this.observer = new ResizeObserver(() => this.fit());
    this.observer.observe(view);
  }

  fit() {
    const w = this.view.clientWidth;
    const h = this.view.clientHeight;
    if (!w || !h) return;
    const s = Math.max(w / STAGE_W, h / STAGE_H);
    const x = (w - STAGE_W * s) / 2;
    const y = (h - STAGE_H * s) / 2;
    this.el.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
  }

  destroy() {
    this.observer.disconnect();
    this.el.remove();
  }
}

// @ts-check
// A seekable, deterministic timeline (design D12). Every frame is computed from scratch
// from the time alone, so any frame can be shown at any moment: the poster, a contact
// sheet, a scrub, or the next frame of playback.

import { ease } from './ease.js';

/** @typedef {import('./ease.js').Ease} Ease */
/** @typedef {Record<string, number>} Props */

/**
 * Anything the timeline can move: numeric properties, and a way to show them.
 * @typedef {object} Actor
 * @property {Props} state the current values, written by the timeline before render()
 * @property {() => void} render
 */

/** @typedef {{ start: number; end: number; from: number; to: number; ease: Ease }} Segment */

/**
 * A procedure: offsets added to an actor's properties while it runs, from a pure function
 * of time. For stepped jitter, shakes and idle sways, which are not tweens.
 * @typedef {{ actor: Actor; start: number; end: number; fn: (time: number, progress: number) => Props }} Proc
 */

/** @typedef {{ dur?: number; ease?: string | Ease }} TweenOptions */

export class Timeline {
  constructor() {
    /** @type {Map<Actor, Props>} */
    this.bases = new Map();
    /** @type {Map<Actor, Map<string, Segment[]>>} */
    this.tracks = new Map();
    /** @type {Proc[]} */
    this.procs = [];
    /** The end of the last tween or procedure, in seconds. */
    this.duration = 0;
  }

  /**
   * Registers an actor with the values it has before anything moves it.
   * @param {Actor} actor
   * @param {Props} base
   */
  add(actor, base) {
    this.bases.set(actor, { ...actor.state, ...(this.bases.get(actor) ?? {}), ...base });
    return actor;
  }

  /**
   * The value of a property at a time, from the segments added so far.
   * @param {Actor} actor
   * @param {string} prop
   * @param {number} t
   */
  valueAt(actor, prop, t) {
    const base = this.bases.get(actor)?.[prop] ?? 0;
    const segments = this.tracks.get(actor)?.get(prop);
    return segments ? sample(segments, t, base) : base;
  }

  /**
   * Tweens properties from the values given to the values given.
   * @param {Actor} actor
   * @param {Props} from
   * @param {Props} to
   * @param {number} at start, seconds
   * @param {TweenOptions} [options]
   */
  fromTo(actor, from, to, at, { dur = 0.5, ease: e = 'power2.out' } = {}) {
    const f = ease(e);
    if (!this.bases.has(actor)) this.add(actor, {});
    let props = this.tracks.get(actor);
    if (!props) this.tracks.set(actor, (props = new Map()));
    for (const prop of Object.keys(to)) {
      const start = from[prop] ?? this.valueAt(actor, prop, at);
      const list = props.get(prop) ?? [];
      // Kept sorted by start; of two starting together, the one added later wins.
      let i = list.length;
      while (i > 0 && list[i - 1].start > at) i--;
      list.splice(i, 0, { start: at, end: at + dur, from: start, to: to[prop], ease: f });
      props.set(prop, list);
    }
    this.duration = Math.max(this.duration, at + dur);
    return this;
  }

  /**
   * Tweens properties from whatever they are at that time.
   * @param {Actor} actor
   * @param {Props} to
   * @param {number} at
   * @param {TweenOptions} [options]
   */
  to(actor, to, at, options) {
    return this.fromTo(actor, {}, to, at, options);
  }

  /**
   * Sets properties at a time, instantly.
   * @param {Actor} actor
   * @param {Props} props
   * @param {number} at
   */
  set(actor, props, at) {
    return this.fromTo(actor, props, props, at, { dur: 0, ease: 'linear' });
  }

  /**
   * Adds offsets to an actor's properties from `at` for `dur` seconds.
   * @param {Actor} actor
   * @param {number} at
   * @param {number} dur
   * @param {(time: number, progress: number) => Props} fn time since `at`, and progress 0..1
   */
  proc(actor, at, dur, fn) {
    if (!this.bases.has(actor)) this.add(actor, {});
    this.procs.push({ actor, start: at, end: at + dur, fn });
    this.duration = Math.max(this.duration, at + dur);
    return this;
  }

  /**
   * Computes every actor at a time and renders it.
   * @param {number} t seconds
   */
  seek(t) {
    for (const [actor, base] of this.bases) {
      // Properties the actor had when added start from their base; any other property
      // (only ever offset by a procedure, or tweened from 0) starts from 0.
      const state = actor.state;
      for (const k of Object.keys(state)) if (!(k in base)) state[k] = 0;
      Object.assign(state, base);
      const props = this.tracks.get(actor);
      if (props) for (const [prop, segments] of props) state[prop] = sample(segments, t, base[prop] ?? 0);
    }
    for (const p of this.procs) {
      if (t < p.start || t >= p.end) continue;
      const offsets = p.fn(t - p.start, (t - p.start) / (p.end - p.start));
      for (const [k, v] of Object.entries(offsets)) p.actor.state[k] = (p.actor.state[k] ?? 0) + v;
    }
    for (const actor of this.bases.keys()) actor.render();
  }
}

/**
 * The value of one property at a time: the base before its first segment, the last
 * started segment's value after that.
 * @param {Segment[]} segments sorted by start
 * @param {number} t
 * @param {number} base
 */
export function sample(segments, t, base) {
  let i = segments.length - 1;
  while (i >= 0 && segments[i].start > t) i--;
  if (i < 0) return base;
  const s = segments[i];
  if (t >= s.end) return s.to;
  const p = s.ease((t - s.start) / (s.end - s.start));
  return s.from + (s.to - s.from) * p;
}

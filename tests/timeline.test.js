// @ts-check
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ease } from '../site/js/anim/ease.js';
import { hash01, rng } from '../site/js/anim/rng.js';
import { Timeline, sample } from '../site/js/anim/timeline.js';

/** An actor that records what it rendered. */
class Probe {
  /** @param {Record<string, number>} state */
  constructor(state) {
    this.state = state;
    /** @type {Record<string, number>[]} */
    this.frames = [];
  }
  render() {
    this.frames.push({ ...this.state });
  }
}

test('easings start at 0 and end at 1', () => {
  for (const name of ['linear', 'power1.in', 'power2.out', 'power3.inOut', 'sine.inOut', 'expo.out', 'back.out(2.4)', 'back.in', 'bounce.out']) {
    const f = ease(name);
    assert.ok(Math.abs(f(0)) < 1e-9, `${name}(0)`);
    assert.ok(Math.abs(f(1) - 1) < 1e-9, `${name}(1)`);
  }
});

test('back.out overshoots and power2.out does not', () => {
  const back = ease('back.out(2.4)');
  const power = ease('power2.out');
  const steps = Array.from({ length: 101 }, (_, i) => i / 100);
  assert.ok(Math.max(...steps.map(back)) > 1.05);
  assert.ok(Math.max(...steps.map(power)) <= 1);
});

test('an unknown easing is an error', () => {
  assert.throws(() => ease('wobble.out'));
});

test('rng is deterministic per seed and stays in [0, 1)', () => {
  const a = rng(42);
  const b = rng(42);
  const xs = Array.from({ length: 1000 }, () => a());
  assert.deepEqual(xs.slice(0, 10), Array.from({ length: 10 }, () => b()));
  assert.ok(xs.every((x) => x >= 0 && x < 1));
  assert.notEqual(rng(1)(), rng(2)());
  assert.equal(hash01(7, 3), hash01(7, 3));
});

test('sample holds the base before, interpolates during and holds the end after', () => {
  const segs = [{ start: 1, end: 2, from: 0, to: 10, ease: ease('linear') }];
  assert.equal(sample(segs, 0.5, 5), 5);
  assert.equal(sample(segs, 1.5, 5), 5);
  assert.equal(sample(segs, 1.25, 5), 2.5);
  assert.equal(sample(segs, 3, 5), 10);
});

test('to() starts from the value the property has at that time', () => {
  const tl = new Timeline();
  const a = new Probe({ x: 0 });
  tl.add(a, {});
  tl.to(a, { x: 100 }, 0, { dur: 1, ease: 'linear' });
  tl.to(a, { x: 50 }, 2, { dur: 1, ease: 'linear' });
  tl.seek(2.5);
  assert.equal(a.state.x, 75);
  assert.equal(tl.duration, 3);
});

test('seeking is independent of the frames seen before', () => {
  const build = () => {
    const tl = new Timeline();
    const a = new Probe({ x: 0, opacity: 0 });
    tl.add(a, {});
    tl.set(a, { opacity: 1 }, 0.5);
    tl.fromTo(a, { x: -100 }, { x: 0 }, 0.5, { dur: 0.5, ease: 'back.out(2)' });
    tl.proc(a, 1, 2, (t) => ({ x: Math.sin(t * 10) * 5 }));
    return { tl, a };
  };
  const one = build();
  const two = build();
  for (const t of [0, 0.3, 0.7, 1.4, 2.9, 0.2, 1.4]) one.tl.seek(t);
  two.tl.seek(1.4);
  assert.deepEqual(one.a.state, two.a.state);
});

test('procedures add offsets only while they run', () => {
  const tl = new Timeline();
  const a = new Probe({ rot: 0 });
  tl.add(a, { rot: 3 });
  tl.proc(a, 1, 1, () => ({ rot: 10 }));
  tl.seek(0.5);
  assert.equal(a.state.rot, 3);
  tl.seek(1.5);
  assert.equal(a.state.rot, 13);
  tl.seek(2.5);
  assert.equal(a.state.rot, 3);
});

test('a later tween starting at the same time wins', () => {
  const tl = new Timeline();
  const a = new Probe({ x: 0 });
  tl.set(a, { x: 1 }, 1);
  tl.set(a, { x: 2 }, 1);
  tl.seek(1);
  assert.equal(a.state.x, 2);
});

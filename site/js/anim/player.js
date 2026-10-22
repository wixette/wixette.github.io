// @ts-check
// Plays a timeline in real time, looping, and reports progress.

/** @typedef {{ seek(t: number): void }} Seekable */

export class Player {
  /**
   * @param {Seekable} timeline
   * @param {number} duration seconds; playback loops at the end
   * @param {(time: number, progress: number) => void} [onFrame]
   */
  constructor(timeline, duration, onFrame) {
    this.timeline = timeline;
    this.duration = duration;
    this.onFrame = onFrame;
    this.time = 0;
    this.playing = false;
    /** @type {number | null} */
    this.frame = null;
    /** @type {number | null} */
    this.last = null;
  }

  play() {
    if (this.playing) return;
    this.playing = true;
    this.last = null;
    /** @param {number} now */
    const tick = (now) => {
      if (!this.playing) return;
      // A long gap (a hidden tab) does not skip ahead.
      const dt = this.last == null ? 0 : Math.min(0.1, (now - this.last) / 1000);
      this.last = now;
      this.seek((this.time + dt) % this.duration);
      this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }

  pause() {
    this.playing = false;
    if (this.frame != null) cancelAnimationFrame(this.frame);
    this.frame = null;
  }

  /** @param {number} t seconds */
  seek(t) {
    this.time = Math.max(0, Math.min(t, this.duration));
    this.timeline.seek(this.time);
    this.onFrame?.(this.time, this.time / this.duration);
  }
}

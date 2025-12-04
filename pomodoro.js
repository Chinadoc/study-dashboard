(function () {
  const STORAGE_KEY = 'pomodoroStateV1';

  class PomodoroTimer {
    constructor(options) {
      const defaults = { workSeconds: 25 * 60, shortBreakSeconds: 5 * 60, longBreakSeconds: 15 * 60, cyclesPerSet: 4 };
      this.config = Object.assign({}, defaults, options || {});
      this.state = {
        active: false,
        taskId: null,
        taskLabel: '',
        phase: 'idle', // 'work' | 'break' | 'complete' | 'idle'
        cycle: 0,
        totalCycles: this.config.cyclesPerSet,
        remainingSeconds: this.config.workSeconds,
        phaseSeconds: this.config.workSeconds,
        startedAt: null,
        paused: false
      };
      this.intervalId = null;
      this.listeners = new Set();
      this._load();
    }

    on(listener) {
      this.listeners.add(listener);
      // send current state immediately
      listener(this.getState());
      return () => this.listeners.delete(listener);
    }

    _emit() {
      const snapshot = this.getState();
      for (const l of this.listeners) l(snapshot);
      this._save();
    }

    getState() {
      return JSON.parse(JSON.stringify(this.state));
    }

    start(taskId, taskLabel, options) {
      if (options) this.config = Object.assign({}, this.config, options);
      this.state.active = true;
      this.state.taskId = taskId;
      this.state.taskLabel = taskLabel || '';
      this.state.phase = 'work';
      this.state.cycle = 1;
      this.state.totalCycles = this.config.cyclesPerSet;
      this.state.phaseSeconds = this.config.workSeconds;
      this.state.remainingSeconds = this.config.workSeconds;
      this.state.paused = false;
      this._startTicking();
      this._emit();
    }

    pause() {
      if (!this.state.active) return;
      this.state.paused = true;
      this._clearTicker();
      this._emit();
    }

    resume() {
      if (!this.state.active) return;
      this.state.paused = false;
      this._startTicking();
      this._emit();
    }

    reset() {
      this._clearTicker();
      this.state = {
        active: false,
        taskId: null,
        taskLabel: '',
        phase: 'idle',
        cycle: 0,
        totalCycles: this.config.cyclesPerSet,
        remainingSeconds: this.config.workSeconds,
        phaseSeconds: this.config.workSeconds,
        startedAt: null,
        paused: false
      };
      this._emit();
    }

    _startTicking() {
      this._clearTicker();
      this.state.startedAt = Date.now();
      this.intervalId = setInterval(() => this._tick(), 1000);
    }

    _clearTicker() {
      if (this.intervalId) clearInterval(this.intervalId);
      this.intervalId = null;
    }

    _tick() {
      if (!this.state.active || this.state.paused) return;
      this.state.remainingSeconds -= 1;
      if (this.state.remainingSeconds <= 0) {
        // advance phase
        if (this.state.phase === 'work') {
          if (this.state.cycle >= this.state.totalCycles) {
            this.state.phase = 'complete';
            this.state.active = false;
            this._clearTicker();
          } else {
            this.state.phase = 'break';
            this.state.phaseSeconds = this.config.shortBreakSeconds;
            this.state.remainingSeconds = this.config.shortBreakSeconds;
          }
        } else if (this.state.phase === 'break') {
          this.state.cycle += 1;
          this.state.phase = 'work';
          this.state.phaseSeconds = this.config.workSeconds;
          this.state.remainingSeconds = this.config.workSeconds;
        }
      }
      this._emit();
    }

    _save() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: this.state, config: this.config })); } catch {}
    }

    _load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const { state, config } = JSON.parse(raw);
        if (config) this.config = Object.assign({}, this.config, config);
        if (state) this.state = Object.assign({}, this.state, state);
      } catch {}
    }
  }

  function formatTime(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
  }

  window.PomodoroEngine = { PomodoroTimer, formatTime };
})();





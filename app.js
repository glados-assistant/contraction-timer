const STORAGE_KEY = 'contraction-timer-v1';

const state = {
  contractions: [],
  activeStart: null,
};

const els = {
  statusText: document.getElementById('statusText'),
  currentDuration: document.getElementById('currentDuration'),
  timeSinceLastStart: document.getElementById('timeSinceLastStart'),
  startBtn: document.getElementById('startBtn'),
  endBtn: document.getElementById('endBtn'),
  totalCount: document.getElementById('totalCount'),
  avgDuration: document.getElementById('avgDuration'),
  avgInterval: document.getElementById('avgInterval'),
  adviceText: document.getElementById('adviceText'),
  historyList: document.getElementById('historyList'),
  clearBtn: document.getElementById('clearBtn'),
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    state.contractions = parsed.contractions || [];
    state.activeStart = parsed.activeStart || null;
  } catch {}
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatDuration(ms) {
  if (ms == null || Number.isNaN(ms)) return '--:--';
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatClock(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function average(values) {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function render() {
  const now = Date.now();
  els.statusText.textContent = state.activeStart ? 'Contraction active' : 'Ready';
  els.currentDuration.textContent = state.activeStart ? formatDuration(now - state.activeStart) : '00:00';

  const last = state.contractions[state.contractions.length - 1];
  const sinceLastStart = state.activeStart && last ? state.activeStart - last.start : null;
  els.timeSinceLastStart.textContent = sinceLastStart != null ? formatDuration(sinceLastStart) : '--:--';

  els.startBtn.disabled = !!state.activeStart;
  els.endBtn.disabled = !state.activeStart;
  els.totalCount.textContent = String(state.contractions.length);

  const durations = state.contractions.map((c) => c.durationMs).filter(Boolean);
  const intervals = state.contractions.map((c) => c.intervalMs).filter((v) => v != null);
  els.avgDuration.textContent = formatDuration(average(durations));
  els.avgInterval.textContent = formatDuration(average(intervals));

  if (state.contractions.length >= 3) {
    const recent = state.contractions.slice(-3);
    const avgRecentInterval = average(recent.map((c) => c.intervalMs).filter((v) => v != null));
    const avgRecentDuration = average(recent.map((c) => c.durationMs));
    if (avgRecentInterval && avgRecentInterval <= 5 * 60 * 1000 && avgRecentDuration >= 60 * 1000) {
      els.adviceText.textContent = 'Recent pattern is around every 5 minutes and lasting about 1 minute. Consider checking in with your provider or birth plan guidance.';
    } else {
      els.adviceText.textContent = 'Pattern is being tracked. Keep logging to see whether intervals are shortening consistently.';
    }
  } else {
    els.adviceText.textContent = 'Not enough data yet. Log a few contractions to see interval patterns.';
  }

  els.historyList.innerHTML = '';
  const items = [...state.contractions].reverse();
  if (!items.length) {
    els.historyList.innerHTML = '<div class="history-item">No contractions logged yet.</div>';
    return;
  }

  for (const item of items) {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <div class="top">
        <strong>${formatClock(item.start)}</strong>
        <span>Duration ${formatDuration(item.durationMs)}</span>
      </div>
      <div class="bottom">
        <span>Ended ${formatClock(item.end)}</span>
        <span>Interval ${formatDuration(item.intervalMs)}</span>
      </div>
    `;
    els.historyList.appendChild(div);
  }
}

function startContraction() {
  if (state.activeStart) return;
  state.activeStart = Date.now();
  save();
  render();
}

function endContraction() {
  if (!state.activeStart) return;
  const start = state.activeStart;
  const end = Date.now();
  const prev = state.contractions[state.contractions.length - 1];
  state.contractions.push({
    start,
    end,
    durationMs: end - start,
    intervalMs: prev ? start - prev.start : null,
  });
  state.activeStart = null;
  save();
  render();
}

function clearAll() {
  if (!confirm('Clear all logged contractions?')) return;
  state.contractions = [];
  state.activeStart = null;
  save();
  render();
}

els.startBtn.addEventListener('click', startContraction);
els.endBtn.addEventListener('click', endContraction);
els.clearBtn.addEventListener('click', clearAll);

load();
render();
setInterval(render, 1000);

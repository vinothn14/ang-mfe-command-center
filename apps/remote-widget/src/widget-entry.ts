import type { EventBusAdapter, EventKey, EventMap } from '@mfe/shared/contracts';

/**
 * Framework-agnostic Web Component (<mfe-pulse-widget>) with Shadow DOM.
 * Zero Angular runtime dependency; communicates with the host EventBus via EventBusAdapter.
 */
export class MfePulseWidget extends HTMLElement {
  private _bus: EventBusAdapter | null = null;
  private unsubscribers: Array<() => void> = [];
  private taskEventCount = 0;
  private lastEventLabel = 'Waiting for EventBus activity...';
  private currentTheme: 'light' | 'dark' = 'dark';

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set bus(adapter: EventBusAdapter | null) {
    this.teardownListeners();
    this._bus = adapter;
    if (this._bus && this.isConnected) {
      this.setupListeners();
    }
    this.render();
  }

  get bus(): EventBusAdapter | null {
    return this._bus;
  }

  connectedCallback(): void {
    if (typeof document !== 'undefined') {
      const attr = document.documentElement.getAttribute('data-theme');
      if (attr === 'light' || attr === 'dark') {
        this.currentTheme = attr;
      }
    }
    this.setupListeners();
    this.render();
  }

  disconnectedCallback(): void {
    this.teardownListeners();
  }

  private setupListeners(): void {
    this.teardownListeners();
    if (!this._bus) return;

    this.unsubscribers.push(
      this._bus.subscribeWithReplay('task:created', task => {
        this.taskEventCount++;
        this.lastEventLabel = `Task created: "${task.title}" [${task.priority}]`;
        this.render();
      }),
      this._bus.subscribeWithReplay('task:status-changed', ev => {
        this.taskEventCount++;
        this.lastEventLabel = `Task ${ev.taskId} moved: ${ev.oldStatus} → ${ev.newStatus}`;
        this.render();
      }),
      this._bus.subscribe('theme:changed', theme => {
        this.currentTheme = theme;
        this.render();
      }),
    );
  }

  private teardownListeners(): void {
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
  }

  private dispatchViaBus<K extends EventKey>(event: K, payload: EventMap[K]): void {
    if (this._bus) {
      this._bus.dispatch(event, payload);
    } else if (event === 'theme:changed') {
      this.currentTheme = payload as 'light' | 'dark';
      this.render();
    }
  }

  private handleToggleTheme = (): void => {
    const next = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.dispatchViaBus('theme:changed', next);
  };

  private handleEmitTask = (): void => {
    const id = `TSK-${Math.floor(100 + Math.random() * 900)}`;
    this.dispatchViaBus('task:created', {
      id,
      title: `Widget Pulse (${id})`,
      description: 'Dispatched from framework-agnostic Web Component remote',
      status: 'todo',
      priority: 'medium',
      assignee: {
        name: 'Pulse Widget',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=PulseWidget',
      },
      tags: ['WebComponent', 'CrossFramework'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    if (!this._bus) {
      this.taskEventCount++;
      this.lastEventLabel = `Standalone pulse emitted: ${id}`;
      this.render();
    }
  };

  private render(): void {
    if (!this.shadowRoot) return;
    const isLight = this.currentTheme === 'light';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .widget-card {
          max-width: 760px;
          margin: 2rem auto;
          padding: 1.75rem;
          border-radius: 12px;
          border: 1px solid ${isLight ? '#cbd5e1' : '#334155'};
          background: ${isLight ? '#ffffff' : '#1e293b'};
          color: ${isLight ? '#0f172a' : '#f8fafc'};
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        .badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.65rem;
          border-radius: 999px;
          background: rgba(14, 165, 233, 0.15);
          color: #38bdf8;
          margin-bottom: 0.75rem;
        }
        h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.4rem;
        }
        p.subtitle {
          margin: 0 0 1.25rem 0;
          color: ${isLight ? '#475569' : '#94a3b8'};
          font-size: 0.92rem;
        }
        .stats-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .stat-box {
          padding: 1rem;
          border-radius: 8px;
          background: ${isLight ? '#f8fafc' : '#0f172a'};
          border: 1px solid ${isLight ? '#e2e8f0' : '#334155'};
        }
        .stat-label {
          font-size: 0.78rem;
          color: ${isLight ? '#64748b' : '#94a3b8'};
          display: block;
          margin-bottom: 0.25rem;
        }
        .stat-value {
          font-size: 1.35rem;
          font-weight: 700;
        }
        .last-event {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          background: ${isLight ? '#f1f5f9' : '#0f172a'};
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.85rem;
          margin-bottom: 1.25rem;
        }
        .actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        button {
          cursor: pointer;
          border: none;
          border-radius: 8px;
          padding: 0.6rem 1rem;
          font-weight: 600;
          font-size: 0.88rem;
        }
        .btn-primary {
          background: #0ea5e9;
          color: #ffffff;
        }
        .btn-secondary {
          background: ${isLight ? '#e2e8f0' : '#334155'};
          color: ${isLight ? '#0f172a' : '#f8fafc'};
        }
      </style>
      <div class="widget-card">
        <span class="badge">Web Component MFE • Zero Angular</span>
        <h2>Cross-Framework Pulse Widget</h2>
        <p class="subtitle">
          Built with a plain Custom Element + Shadow DOM on port 4204, wired to the Angular EventBus via a thin adapter.
        </p>
        <div class="stats-row">
          <div class="stat-box">
            <span class="stat-label">Task Bus Events Observed</span>
            <span class="stat-value" data-testid="widget-event-count">${this.taskEventCount}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Synced Theme Mode</span>
            <span class="stat-value" data-testid="widget-theme">${this.currentTheme}</span>
          </div>
        </div>
        <div class="last-event" data-testid="widget-last-event">${this.lastEventLabel}</div>
        <div class="actions">
          <button class="btn-primary" id="emit-task-btn">Emit Task Pulse</button>
          <button class="btn-secondary" id="toggle-theme-btn">Toggle Shell Theme</button>
        </div>
      </div>
    `;

    this.shadowRoot.getElementById('emit-task-btn')?.addEventListener('click', this.handleEmitTask);
    this.shadowRoot
      .getElementById('toggle-theme-btn')
      ?.addEventListener('click', this.handleToggleTheme);
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('mfe-pulse-widget')) {
  customElements.define('mfe-pulse-widget', MfePulseWidget);
}

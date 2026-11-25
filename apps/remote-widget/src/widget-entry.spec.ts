import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MfePulseWidget } from './widget-entry';
import type { EventBusAdapter, EventKey, EventMap } from '@mfe/shared/contracts';

describe('MfePulseWidget (Web Component)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should register custom element and render shadow DOM', () => {
    expect(customElements.get('mfe-pulse-widget')).toBe(MfePulseWidget);
    const el = new MfePulseWidget();
    document.body.appendChild(el);

    expect(el.shadowRoot).toBeTruthy();
    expect(el.shadowRoot?.textContent).toContain('Cross-Framework Pulse Widget');
  });

  it('should consume EventBusAdapter replay events and dispatch theme changes', () => {
    const dispatchMock = vi.fn();
    const unsubMock = vi.fn();

    const adapter: EventBusAdapter = {
      subscribe: <K extends EventKey>(_event: K, _handler: (p: EventMap[K]) => void) => unsubMock,
      subscribeWithReplay: <K extends EventKey>(event: K, handler: (p: EventMap[K]) => void) => {
        if (event === 'task:created') {
          (handler as (p: EventMap['task:created']) => void)({
            id: 'TSK-1',
            title: 'Adapter Task',
            description: '',
            status: 'todo',
            priority: 'high',
            assignee: { name: 'A', avatarUrl: '' },
            tags: [],
            createdAt: '',
            updatedAt: '',
          });
        }
        return unsubMock;
      },
      dispatch: dispatchMock,
    };

    const el = new MfePulseWidget();
    el.bus = adapter;
    document.body.appendChild(el);

    const countEl = el.shadowRoot?.querySelector('[data-testid="widget-event-count"]');
    expect(countEl?.textContent).toBe('1');

    const toggleBtn = el.shadowRoot?.getElementById('toggle-theme-btn');
    toggleBtn?.click();
    expect(dispatchMock).toHaveBeenCalledWith('theme:changed', 'light');
  });
});

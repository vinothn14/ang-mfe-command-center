import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventBusService } from '@mfe/shared/event-bus';
import { ERROR_REPORTER_TOKEN, EventBusAdapter, EventKey, EventMap } from '@mfe/shared/contracts';
import { RemoteFallbackComponent } from '../fallback/remote-fallback.component';

interface PulseWidgetElement extends HTMLElement {
  bus?: EventBusAdapter | null;
}

@Component({
  selector: 'app-widget-host',
  standalone: true,
  imports: [CommonModule, RemoteFallbackComponent],
  template: `
    @if (isLoading()) {
      <div class="widget-loading">Loading framework-agnostic Web Component remote...</div>
    }

    @if (errorMessage()) {
      <app-remote-fallback
        remoteName="remote-widget"
        [remoteUrl]="widgetUrl"
        [errorMessage]="errorMessage()!"
        (click)="handleRetry($event)"
      />
    }

    <div #widgetSlot></div>
  `,
  styles: [
    `
      .widget-loading {
        padding: 2rem;
        text-align: center;
        color: var(--color-text-muted);
      }
    `,
  ],
})
export class WidgetHostComponent implements OnInit, OnDestroy {
  private readonly eventBus = inject(EventBusService);
  private readonly errorReporter = inject(ERROR_REPORTER_TOKEN);

  @ViewChild('widgetSlot', { static: true })
  private widgetSlot?: ElementRef<HTMLDivElement>;

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly widgetUrl = this.resolveWidgetUrl();

  private mountedEl: PulseWidgetElement | null = null;

  ngOnInit(): void {
    this.loadWidget();
  }

  ngOnDestroy(): void {
    if (this.mountedEl) {
      this.mountedEl.bus = null;
      this.mountedEl.remove();
      this.mountedEl = null;
    }
  }

  async loadWidget(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await import(/* @vite-ignore */ this.widgetUrl);
      this.isLoading.set(false);

      const el = document.createElement('mfe-pulse-widget') as PulseWidgetElement;
      el.bus = this.createBusAdapter();
      this.mountedEl = el;

      if (this.widgetSlot) {
        this.widgetSlot.nativeElement.innerHTML = '';
        this.widgetSlot.nativeElement.appendChild(el);
      }

      this.eventBus.dispatch('remote:loaded', {
        remoteName: 'remote-widget',
        url: this.widgetUrl,
        timestamp: Date.now(),
      });
    } catch (err: unknown) {
      this.isLoading.set(false);
      const msg = err instanceof Error ? err.message : 'Failed to load Web Component remote';
      this.errorMessage.set(msg);

      this.errorReporter.captureException(err, {
        remoteName: 'remote-widget',
        remoteVersion: '0.1.0',
        url: this.widgetUrl,
        tags: { phase: 'remote-load', framework: 'web-component' },
      });

      this.eventBus.dispatch('remote:error', {
        remoteName: 'remote-widget',
        remoteVersion: '0.1.0',
        error: msg,
        timestamp: Date.now(),
      });
    }
  }

  handleRetry(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.closest('.btn-primary')) {
      event.preventDefault();
      event.stopPropagation();
      this.loadWidget();
    }
  }

  private createBusAdapter(): EventBusAdapter {
    return {
      subscribe: <K extends EventKey>(event: K, handler: (payload: EventMap[K]) => void) => {
        const sub = this.eventBus.on(event).subscribe(handler);
        return () => sub.unsubscribe();
      },
      subscribeWithReplay: <K extends EventKey>(
        event: K,
        handler: (payload: EventMap[K]) => void,
      ) => {
        const sub = this.eventBus.onWithReplay(event).subscribe(handler);
        return () => sub.unsubscribe();
      },
      dispatch: <K extends EventKey>(event: K, payload: EventMap[K]) => {
        this.eventBus.dispatch(event, payload);
      },
    };
  }

  private resolveWidgetUrl(): string {
    const isLocalhost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.endsWith('.local'));

    return isLocalhost
      ? 'http://localhost:4204/widget-entry.js'
      : 'https://mfe-remote-widget.vercel.app/widget-entry.js';
  }
}

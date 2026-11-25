import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { RemoteFallbackComponent } from '../fallback/remote-fallback.component';
import { EventBusService } from '@mfe/shared/event-bus';
import { ERROR_REPORTER_TOKEN } from '@mfe/shared/contracts';

@Component({
  selector: 'app-remote-loader',
  standalone: true,
  imports: [CommonModule, RemoteFallbackComponent],
  template: `
    @if (isLoading()) {
      <div class="remote-skeleton-container">
        <div class="skeleton-header">
          <div class="skeleton-pill"></div>
          <div class="skeleton-title"></div>
        </div>
        <div class="skeleton-grid">
          <div class="skeleton-col"></div>
          <div class="skeleton-col"></div>
          <div class="skeleton-col"></div>
          <div class="skeleton-col"></div>
        </div>
      </div>
    }

    @if (errorMessage()) {
      <app-remote-fallback
        [remoteName]="remoteName"
        [remoteUrl]="remoteUrl"
        [errorMessage]="errorMessage()!"
        (click)="handleRetryFromFallback($event)"
      />
    }

    <ng-template #remoteContainer></ng-template>
  `,
  styles: [
    `
      .remote-skeleton-container {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
      }
      .skeleton-header {
        margin-bottom: 2rem;
      }
      .skeleton-pill {
        width: 120px;
        height: 20px;
        background: var(--color-bg-muted);
        border-radius: var(--radius-full);
        margin-bottom: 0.75rem;
        animation: pulse-shimmer 1.5s infinite;
      }
      .skeleton-title {
        width: 280px;
        height: 36px;
        background: var(--color-bg-muted);
        border-radius: var(--radius-md);
        animation: pulse-shimmer 1.5s infinite;
      }
      .skeleton-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1.5rem;
      }
      .skeleton-col {
        height: 480px;
        background: var(--color-bg-surface);
        border: 1px solid var(--color-border-subtle);
        border-radius: var(--radius-md);
        animation: pulse-shimmer 1.5s infinite;
      }
      @keyframes pulse-shimmer {
        0%,
        100% {
          opacity: 0.4;
        }
        50% {
          opacity: 0.8;
        }
      }
    `,
  ],
})
export class RemoteLoaderComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventBus = inject(EventBusService);
  private readonly errorReporter = inject(ERROR_REPORTER_TOKEN);

  @ViewChild('remoteContainer', { read: ViewContainerRef, static: false })
  private containerRef?: ViewContainerRef;

  @Input() remoteName = 'remote-tasks';
  @Input() remoteVersion = '0.1.0';
  @Input() exposedModule = './Component';
  @Input() remoteUrl = 'http://localhost:4201/remoteEntry.json';

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const data = this.route.snapshot.data;
    if (data['remoteName']) this.remoteName = data['remoteName'];
    if (data['remoteVersion']) this.remoteVersion = data['remoteVersion'];
    if (data['exposedModule']) this.exposedModule = data['exposedModule'];
    if (data['remoteUrl']) this.remoteUrl = data['remoteUrl'];

    this.loadRemote();
  }

  async loadRemote(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const module = await loadRemoteModule(this.remoteName, this.exposedModule);
      this.isLoading.set(false);

      // Find exposed component class
      const ComponentClass =
        module.TasksBoardComponent ||
        module.default ||
        Object.values(module).find((v: any) => typeof v === 'function');

      if (!ComponentClass) {
        throw new Error(
          `Module "${this.exposedModule}" in remote "${this.remoteName}" has no exported component`,
        );
      }

      this.eventBus.dispatch('remote:loaded', {
        remoteName: this.remoteName,
        url: this.remoteUrl,
        timestamp: Date.now(),
      });

      // Render dynamically into the view container
      setTimeout(() => {
        if (this.containerRef) {
          this.containerRef.clear();
          this.containerRef.createComponent(ComponentClass as any);
        }
      });
    } catch (err: any) {
      this.isLoading.set(false);
      const msg = err?.message || 'Network error loading micro-frontend entry';
      this.errorMessage.set(msg);

      this.errorReporter.captureException(err, {
        remoteName: this.remoteName,
        remoteVersion: this.remoteVersion,
        url: this.remoteUrl,
        tags: { phase: 'remote-load' },
      });

      this.eventBus.dispatch('remote:error', {
        remoteName: this.remoteName,
        remoteVersion: this.remoteVersion,
        error: msg,
        timestamp: Date.now(),
      });
    }
  }

  handleRetryFromFallback(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.closest('.btn-primary')) {
      event.preventDefault();
      event.stopPropagation();
      this.loadRemote();
    }
  }
}

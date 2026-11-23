import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-remote-fallback',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './remote-fallback.component.html',
  styleUrls: ['./remote-fallback.component.scss'],
})
export class RemoteFallbackComponent {
  @Input() remoteName = 'remote-tasks';
  @Input() remoteUrl = 'http://localhost:4201/remoteEntry.json';
  @Input() errorMessage = 'Failed to fetch remoteEntry.json from manifest endpoint';

  readonly isRetrying = signal(false);
  readonly retryCount = signal(0);

  retry(): void {
    this.isRetrying.set(true);
    this.retryCount.update(c => c + 1);

    setTimeout(() => {
      this.isRetrying.set(false);
      // Hard refresh or re-navigate to attempt dynamic import again
      window.location.reload();
    }, 900);
  }
}

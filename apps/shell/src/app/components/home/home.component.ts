import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventBusService } from '@mfe/shared/event-bus';
import { Subscription } from 'rxjs';

interface BusLogItem {
  event: string;
  payload: string;
  time: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly eventBus = inject(EventBusService);
  private sub = new Subscription();

  readonly recentEvents = signal<BusLogItem[]>([]);

  ngOnInit(): void {
    // Listen to all major bus events to render a live telemetry feed
    this.sub.add(
      this.eventBus.on('theme:changed').subscribe(theme => {
        this.addLog('theme:changed', `Theme switched to "${theme}"`);
      }),
    );

    this.sub.add(
      this.eventBus.on('auth:state-changed').subscribe(auth => {
        this.addLog(
          'auth:state-changed',
          auth.isAuthenticated
            ? `User "${auth.user?.name}" authenticated as [${auth.user?.role}]`
            : 'User logged out',
        );
      }),
    );

    this.sub.add(
      this.eventBus.on('task:status-changed').subscribe(e => {
        this.addLog(
          'task:status-changed',
          `Task [${e.taskId}] transitioned: ${e.oldStatus} ➔ ${e.newStatus}`,
        );
      }),
    );

    this.sub.add(
      this.eventBus.on('task:created').subscribe(t => {
        this.addLog('task:created', `New task created: "${t.title}" (${t.priority})`);
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private addLog(event: string, payload: string): void {
    const item: BusLogItem = {
      event,
      payload,
      time: new Date().toLocaleTimeString(),
    };
    this.recentEvents.update(list => [item, ...list].slice(0, 8));
  }
}

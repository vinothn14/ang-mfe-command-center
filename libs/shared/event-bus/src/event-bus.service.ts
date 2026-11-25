import { Injectable, signal, Signal } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { EventKey, EventMap } from '@mfe/shared/contracts';

interface BusEnvelope<K extends EventKey = EventKey> {
  key: K;
  payload: EventMap[K];
  timestamp: number;
}

const REPLAY_BUFFER_SIZE = 100;

/**
 * Enterprise Micro-Frontend Cross-Remote Typed Event Bus.
 *
 * Implements a decoupled pub/sub pattern across runtime MFEs.
 * Shared as a strict singleton via Native Federation ESM import maps.
 */
@Injectable({
  providedIn: 'root',
})
export class EventBusService {
  private readonly stream$ = new Subject<BusEnvelope<EventKey>>();
  private readonly replayStream$ = new ReplaySubject<BusEnvelope<EventKey>>(REPLAY_BUFFER_SIZE);

  /**
   * Dispatches a strongly-typed event onto the bus.
   */
  dispatch<K extends EventKey>(event: K, payload: EventMap[K]): void {
    const envelope: BusEnvelope<K> = {
      key: event,
      payload,
      timestamp: Date.now(),
    };
    this.stream$.next(envelope);
    this.replayStream$.next(envelope);
  }

  /**
   * Listens to a strongly-typed event stream as an RxJS Observable (live events only).
   */
  on<K extends EventKey>(event: K): Observable<EventMap[K]> {
    return this.stream$.asObservable().pipe(
      filter((envelope): envelope is BusEnvelope<K> => envelope.key === event),
      map(envelope => envelope.payload),
    );
  }

  /**
   * Listens to a strongly-typed event stream with replay of recent buffered events.
   * Useful for lazy-loaded remotes mounted after events were already dispatched.
   */
  onWithReplay<K extends EventKey>(event: K): Observable<EventMap[K]> {
    return this.replayStream$.asObservable().pipe(
      filter((envelope): envelope is BusEnvelope<K> => envelope.key === event),
      map(envelope => envelope.payload),
    );
  }

  /**
   * Creates an Angular Signal that tracks the latest value of an event.
   */
  toSignal<K extends EventKey>(event: K, initialValue: EventMap[K]): Signal<EventMap[K]> {
    const s = signal<EventMap[K]>(initialValue);
    this.on(event).subscribe(val => s.set(val));
    return s.asReadonly();
  }
}

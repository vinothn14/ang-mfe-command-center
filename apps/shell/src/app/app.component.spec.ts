import { describe, it, expect } from 'vitest';
import { AppComponent } from './app.component';

describe('AppComponent (Shell)', () => {
  it('should create the shell application component', () => {
    const app = new AppComponent();
    expect(app).toBeTruthy();
  });
});

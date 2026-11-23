import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="denied-container">
      <div class="denied-card">
        <div class="icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <div class="status-pill">RBAC Policy Guard</div>
        <h2>Access Denied</h2>
        <p class="desc">
          Your current session role is
          <strong class="role-badge">{{ auth.role() }}</strong
          >. The requested micro-frontend module requires elevated permissions (architect, admin,
          or developer).
        </p>

        <div class="guidance-box">
          <h4>Role-Based Access Control Rule</h4>
          <p>
            Viewer roles are restricted to read-only observation. In a production enterprise
            deployment, contact your workspace administrator to request a role elevation.
          </p>
        </div>

        <div class="actions">
          <button class="btn btn-primary" (click)="elevateToArchitect()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>Switch to Architect Role</span>
          </button>
          <a routerLink="/" class="btn btn-secondary">Return to Dashboard</a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .denied-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: calc(100vh - 160px);
        padding: 2rem;
      }
      .denied-card {
        max-width: 560px;
        width: 100%;
        background: var(--color-bg-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: 2.25rem;
        box-shadow: var(--shadow-lg);
        text-align: center;
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--color-danger);
        }
      }
      .icon-wrap {
        width: 56px;
        height: 56px;
        border-radius: var(--radius-md);
        background: var(--color-danger-bg);
        color: var(--color-danger);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.25rem;

        svg {
          width: 30px;
          height: 30px;
        }
      }
      .status-pill {
        display: inline-block;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 0.2rem 0.6rem;
        border-radius: var(--radius-full);
        background: var(--color-danger-bg);
        color: var(--color-danger);
        margin-bottom: 0.5rem;
      }
      h2 {
        font-size: 1.65rem;
        font-weight: 700;
        color: var(--color-text-primary);
        margin-bottom: 0.5rem;
      }
      .desc {
        color: var(--color-text-secondary);
        font-size: 0.95rem;
        line-height: 1.55;
        margin-bottom: 1.5rem;

        .role-badge {
          font-family: var(--font-family-mono);
          text-transform: uppercase;
          color: var(--color-danger);
          font-weight: 700;
        }
      }
      .guidance-box {
        background: var(--color-bg-canvas);
        border: 1px solid var(--color-border-subtle);
        border-radius: var(--radius-md);
        padding: 1rem 1.25rem;
        margin-bottom: 1.75rem;
        text-align: left;

        h4 {
          font-size: 0.85rem;
          color: var(--color-text-primary);
          margin-bottom: 0.25rem;
        }
        p {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          line-height: 1.45;
        }
      }
      .actions {
        display: flex;
        justify-content: center;
        gap: 0.75rem;
        flex-wrap: wrap;

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: var(--radius-md);
          cursor: pointer;

          svg {
            width: 16px;
            height: 16px;
          }

          &.btn-primary {
            background: var(--color-brand-primary);
            color: var(--color-text-inverse);
            &:hover {
              background: var(--color-brand-primary-hover);
            }
          }
          &.btn-secondary {
            background: var(--color-bg-muted);
            color: var(--color-text-primary);
          }
        }
      }
    `,
  ],
})
export class AccessDeniedComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  elevateToArchitect(): void {
    this.auth.switchRole('architect');
    this.router.navigate(['/settings']);
  }
}

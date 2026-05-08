import {
  Component,
  ChangeDetectionStrategy,
  output,
  ElementRef,
  inject,
  OnInit,
  OnDestroy,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-pull-to-refresh',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (pulling()) {
      <div class="pull-indicator" [style.height.px]="pullDistance()">
        <div class="pull-icon" [class.refreshing]="refreshing()">&#8635;</div>
        <span class="pull-text">{{ refreshing() ? 'Refreshing...' : 'Pull to refresh' }}</span>
      </div>
    }
  `,
  styleUrl: './pull-to-refresh.scss',
})
export class PullToRefresh implements OnInit, OnDestroy {
  readonly refresh = output<void>();

  protected readonly pulling = signal(false);
  protected readonly refreshing = signal(false);
  protected readonly pullDistance = signal(0);

  private readonly el = inject(ElementRef);
  private startY = 0;
  private readonly THRESHOLD = 80;

  private touchStartFn = this.onTouchStart.bind(this);
  private touchMoveFn = this.onTouchMove.bind(this);
  private touchEndFn = this.onTouchEnd.bind(this);

  ngOnInit(): void {
    const container = this.el.nativeElement.parentElement;
    container?.addEventListener('touchstart', this.touchStartFn, { passive: true });
    container?.addEventListener('touchmove', this.touchMoveFn, { passive: false });
    container?.addEventListener('touchend', this.touchEndFn, { passive: true });
  }

  ngOnDestroy(): void {
    const container = this.el.nativeElement.parentElement;
    container?.removeEventListener('touchstart', this.touchStartFn);
    container?.removeEventListener('touchmove', this.touchMoveFn);
    container?.removeEventListener('touchend', this.touchEndFn);
  }

  private onTouchStart(e: TouchEvent): void {
    if (window.scrollY === 0) {
      this.startY = e.touches[0].clientY;
    }
  }

  private onTouchMove(e: TouchEvent): void {
    if (this.refreshing() || window.scrollY > 0) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - this.startY;

    if (diff > 0 && this.startY > 0) {
      e.preventDefault();
      this.pulling.set(true);
      this.pullDistance.set(Math.min(diff * 0.5, 120));
    }
  }

  private onTouchEnd(): void {
    if (this.pullDistance() >= this.THRESHOLD) {
      this.refreshing.set(true);
      this.refresh.emit();
      setTimeout(() => {
        this.refreshing.set(false);
        this.pulling.set(false);
        this.pullDistance.set(0);
      }, 1000);
    } else {
      this.pulling.set(false);
      this.pullDistance.set(0);
    }
    this.startY = 0;
  }
}

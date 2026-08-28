import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';

import { HapticFeedbackService } from '../../services/haptic-feedback.service';

export interface AppSelectOption {
  readonly value: string;
  readonly label: string;
  readonly detail?: string;
  readonly disabled?: boolean;
  readonly icon?: string;
  readonly swatch?: string;
}

@Component({
  selector: 'app-select-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon],
  host: {
    '(window:expenzo-back-button)': 'onNativeBack($event)',
  },
  template: `
    @if (label()) {
      <span class="field-label">{{ label() }}</span>
    }
    <button
      #trigger
      type="button"
      class="picker-trigger"
      [class.compact]="compact()"
      [disabled]="disabled()"
      [attr.aria-expanded]="open()"
      [attr.aria-label]="label() ? label() + ': ' + selectedLabel() : selectedLabel()"
      aria-haspopup="dialog"
      (click)="show()"
    >
      @if (selectedOption()?.icon; as icon) {
        <svg class="leading-icon" [lucideIcon]="icon" aria-hidden="true"></svg>
      }
      @if (selectedOption()?.swatch; as swatch) {
        <span class="option-swatch compact-swatch" [style.background-color]="swatch"></span>
      }
      <span class="selected-label">{{ selectedLabel() }}</span>
      <svg class="chevron" lucideIcon="chevron-down" aria-hidden="true"></svg>
    </button>
    @if (hint()) {
      <small>{{ hint() }}</small>
    }

    @if (open()) {
      <div
        class="picker-backdrop"
        role="presentation"
        (click)="onBackdropClick($event)"
        (keydown)="onBackdropKeydown($event)"
      >
        <section
          #sheet
          class="picker-sheet"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="sheetTitle() || label() || 'Choose an option'"
          tabindex="-1"
        >
          <div class="picker-top">
            <header>
              <strong>{{ sheetTitle() || label() || 'Choose an option' }}</strong>
              <button type="button" aria-label="Close options" (click)="close()">
                <svg lucideIcon="x" aria-hidden="true"></svg>
              </button>
            </header>
            @if (searchable()) {
              <label class="picker-search">
                <span class="visually-hidden">Search options</span>
                <svg lucideIcon="search" aria-hidden="true"></svg>
                <input
                  #searchInput
                  type="search"
                  autocomplete="off"
                  [placeholder]="searchPlaceholder()"
                  [value]="searchQuery()"
                  (input)="updateSearch($event)"
                />
              </label>
            }
          </div>
          <div class="picker-options" role="listbox" [attr.aria-label]="sheetTitle() || label()">
            @for (option of filteredOptions(); track option.value) {
              <button
                type="button"
                class="picker-option"
                [class.selected]="option.value === value()"
                [disabled]="option.disabled"
                role="option"
                [attr.aria-selected]="option.value === value()"
                (click)="select(option.value)"
              >
                @if (option.icon) {
                  <svg class="option-icon" [lucideIcon]="option.icon" aria-hidden="true"></svg>
                }
                @if (option.swatch) {
                  <span class="option-swatch" [style.background-color]="option.swatch"></span>
                }
                <span class="option-copy">
                  <strong>{{ option.label }}</strong>
                  @if (option.detail) {
                    <small>{{ option.detail }}</small>
                  }
                </span>
                @if (option.value === value()) {
                  <svg class="option-check" lucideIcon="circle-check" aria-hidden="true"></svg>
                }
              </button>
            } @empty {
              <p class="picker-empty" role="status">No matching options</p>
            }
          </div>
        </section>
      </div>
    }
  `,
  styleUrl: './app-select-picker.scss',
})
export class AppSelectPicker {
  private readonly haptics = inject(HapticFeedbackService);
  readonly label = input('');
  readonly sheetTitle = input('');
  readonly value = input('');
  readonly placeholder = input('Choose an option');
  readonly hint = input('');
  readonly disabled = input(false);
  readonly compact = input(false);
  readonly searchable = input(false);
  readonly searchPlaceholder = input('Search options');
  readonly options = input.required<readonly AppSelectOption[]>();
  readonly valueChange = output<string>();

  protected readonly open = signal(false);
  protected readonly searchQuery = signal('');
  protected readonly selectedOption = computed(() =>
    this.options().find((option) => option.value === this.value()),
  );
  protected readonly selectedLabel = computed(
    () => this.selectedOption()?.label ?? this.placeholder(),
  );
  protected readonly filteredOptions = computed(() => {
    const query = this.normalizeSearch(this.searchQuery());
    if (!query) return this.options();
    return this.options().filter((option) =>
      this.normalizeSearch(`${option.label} ${option.detail ?? ''} ${option.value}`).includes(
        query,
      ),
    );
  });

  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly sheet = viewChild<ElementRef<HTMLElement>>('sheet');
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  constructor() {
    effect((onCleanup) => {
      if (!this.open()) {
        return;
      }

      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      window.setTimeout(() => {
        const sheet = this.sheet()?.nativeElement;
        if (this.searchable()) {
          this.searchInput()?.nativeElement.focus();
          return;
        }
        const selected = sheet?.querySelector<HTMLElement>(
          '.picker-option.selected:not(:disabled)',
        );
        const first = sheet?.querySelector<HTMLElement>('.picker-option:not(:disabled)');
        (selected ?? first ?? sheet)?.focus();
      });

      onCleanup(() => {
        document.body.style.overflow = previousOverflow;
      });
    });
  }

  protected show(): void {
    if (!this.disabled()) {
      this.searchQuery.set('');
      this.open.set(true);
    }
  }

  protected updateSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected close(): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    window.setTimeout(() => this.trigger().nativeElement.focus());
  }

  protected select(value: string): void {
    this.haptics.trigger('selection');
    this.valueChange.emit(value);
    this.close();
  }

  protected onNativeBack(event: Event): void {
    if (this.open()) {
      event.preventDefault();
      this.close();
    }
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  protected onBackdropKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const sheet = this.sheet()?.nativeElement;
    const focusable = Array.from(
      sheet?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)') ?? [],
    );
    if (focusable.length === 0) {
      event.preventDefault();
      sheet?.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private normalizeSearch(value: string): string {
    return value
      .trim()
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}

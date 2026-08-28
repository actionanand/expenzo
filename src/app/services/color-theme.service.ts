import { Injectable, signal } from '@angular/core';

export type ColorThemeId = 'forest' | 'rose' | 'ocean' | 'violet' | 'teal' | 'amber';

export interface ColorThemeOption {
  readonly id: ColorThemeId;
  readonly label: string;
  readonly description: string;
  readonly swatch: string;
}

export const COLOR_THEME_OPTIONS: readonly ColorThemeOption[] = [
  {
    id: 'forest',
    label: 'Forest green',
    description: 'The original Expenzo palette',
    swatch: '#2e7d32',
  },
  {
    id: 'rose',
    label: 'Rose pink',
    description: 'Warm pink with berry accents',
    swatch: '#ad1457',
  },
  {
    id: 'ocean',
    label: 'Ocean blue',
    description: 'Clear blue with calm surfaces',
    swatch: '#1565c0',
  },
  {
    id: 'violet',
    label: 'Violet',
    description: 'Rich violet with soft lilac surfaces',
    swatch: '#6a1b9a',
  },
  {
    id: 'teal',
    label: 'Teal',
    description: 'Balanced teal with cool surfaces',
    swatch: '#00695c',
  },
  {
    id: 'amber',
    label: 'Amber',
    description: 'Warm gold with neutral surfaces',
    swatch: '#8a4b00',
  },
];

const STORAGE_KEY = 'expenzo-color-theme';
const DEFAULT_THEME: ColorThemeId = 'forest';

@Injectable({ providedIn: 'root' })
export class ColorThemeService {
  private readonly state = signal<ColorThemeId>(this.load());

  readonly theme = this.state.asReadonly();

  initialize(): void {
    this.apply(this.state());
  }

  set(theme: string): void {
    if (!isColorTheme(theme)) return;
    this.state.set(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // The selected palette still works for the current session.
    }
    this.apply(theme);
  }

  private load(): ColorThemeId {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return isColorTheme(saved) ? saved : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  }

  private apply(theme: ColorThemeId): void {
    document.documentElement.setAttribute('data-color-theme', theme);
    const background = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-bg')
      .trim();
    if (background) {
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', background);
    }
  }
}

function isColorTheme(value: string | null): value is ColorThemeId {
  return COLOR_THEME_OPTIONS.some((option) => option.id === value);
}

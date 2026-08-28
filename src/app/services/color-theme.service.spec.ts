import { TestBed } from '@angular/core/testing';

import { ColorThemeService } from './color-theme.service';

describe('ColorThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-color-theme');
    TestBed.resetTestingModule();
  });

  it('uses forest as the default palette', () => {
    const service = TestBed.inject(ColorThemeService);
    service.initialize();

    expect(service.theme()).toBe('forest');
    expect(document.documentElement.getAttribute('data-color-theme')).toBe('forest');
  });

  it('applies and persists a selected palette', () => {
    const service = TestBed.inject(ColorThemeService);
    service.set('rose');

    expect(service.theme()).toBe('rose');
    expect(localStorage.getItem('expenzo-color-theme')).toBe('rose');
    expect(document.documentElement.getAttribute('data-color-theme')).toBe('rose');
  });

  it('restores a saved palette', () => {
    localStorage.setItem('expenzo-color-theme', 'ocean');

    const service = TestBed.inject(ColorThemeService);
    service.initialize();

    expect(service.theme()).toBe('ocean');
  });

  it('ignores unsupported palette values', () => {
    const service = TestBed.inject(ColorThemeService);
    service.set('unknown');

    expect(service.theme()).toBe('forest');
  });
});

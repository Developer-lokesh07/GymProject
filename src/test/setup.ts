import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock IntersectionObserver for components that use it (StatsBanner, Header, App)
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly scrollMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  private callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element): void {
    // Immediately trigger the callback with isIntersecting = true
    this.callback(
      [
        {
          isIntersecting: true,
          target,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRatio: 1,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          time: Date.now(),
        },
      ],
      this,
    );
  }

  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Mock scrollIntoView (used by App's handlePlanSelect)
Element.prototype.scrollIntoView = vi.fn();

// Mock window.alert for form validation tests
window.alert = vi.fn();

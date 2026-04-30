import { SMALL_SCREEN_BREAKPOINTS, isSmallScreenViewport } from './screen.js';

describe('screen breakpoints', () => {
    test('treats the Playwright codegen viewport as compact', () => {
        expect(isSmallScreenViewport({ width: 1280, height: 720 })).toBe(true);
    });

    test('keeps larger desktop viewports out of compact mode', () => {
        expect(isSmallScreenViewport({ width: 1366, height: 768 })).toBe(false);
    });

    test('uses shared centralized breakpoint values', () => {
        expect(SMALL_SCREEN_BREAKPOINTS).toEqual({ maxWidth: 375, maxHeight: 720 });
    });
});

import { route, routes } from '../routes';

describe('Route Helpers', () => {
    describe('routes', () => {
        it('defines all required routes', () => {
            expect(routes).toHaveProperty('core.modules.index');
            expect(routes).toHaveProperty('core.modules.show');
            expect(routes).toHaveProperty('core.modules.initialize');
            expect(routes).toHaveProperty('core.modules.configure');
            expect(routes).toHaveProperty('core.modules.status');
        });

        it('has correct route patterns', () => {
            expect(routes['core.modules.index']).toBe('/modules');
            expect(routes['core.modules.show']).toBe('/modules/:name');
            expect(routes['core.modules.initialize']).toBe('/api/modules/:name/initialize');
            expect(routes['core.modules.configure']).toBe('/api/modules/:name/configure');
            expect(routes['core.modules.status']).toBe('/api/modules/:name/status');
        });
    });

    describe('route', () => {
        it('returns correct URL for routes without parameters', () => {
            expect(route('core.modules.index')).toBe('/modules');
        });

        it('replaces parameters in route patterns', () => {
            expect(route('core.modules.show', { name: 'test-module' })).toBe('/modules/test-module');

            expect(route('core.modules.initialize', { name: 'test-module' })).toBe('/api/modules/test-module/initialize');
        });

        it('handles numeric parameters', () => {
            expect(route('core.modules.show', { name: 123 })).toBe('/modules/123');
        });

        it('throws error for invalid route names', () => {
            expect(() => route('invalid.route' as any)).toThrow();
        });
    });
});

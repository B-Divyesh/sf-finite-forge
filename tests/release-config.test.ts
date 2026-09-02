import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('static deployment contract', () => {
  it('@claim:response-policy ships CSP, immutable assets, and a true 404 rewrite', () => {
    const source = readFileSync(resolve('staticwebapp.config.json'), 'utf8');
    const shipped = readFileSync(resolve('public/staticwebapp.config.json'), 'utf8');
    expect(shipped).toBe(source);
    const config = JSON.parse(source) as { globalHeaders: Record<string, string>; routes: Array<{ route: string; headers?: Record<string, string>; rewrite?: string }>; responseOverrides: Record<string, { rewrite: string }> };
    expect(config.globalHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    expect(config.routes).toContainEqual({ route: '/assets/*', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } });
    expect(config.routes.filter(route => route.rewrite === '/index.html').map(route => route.route)).toEqual(['/demo', '/privacy', '/terms']);
    expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html' });
  });
});

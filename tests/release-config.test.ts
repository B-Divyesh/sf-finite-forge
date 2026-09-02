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
    expect(config.globalHeaders['Content-Security-Policy']).toContain("connect-src 'self' https://api.sociobot.in");
    expect(config.routes).toContainEqual({ route: '/assets/*', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } });
    expect(config.routes.filter(route => route.rewrite === '/index.html').map(route => route.route)).toEqual(['/demo', '/privacy', '/terms']);
    expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html' });
  });

  it('@claim:generated-image-provenance discloses the generated blueprint and records its source prompt', () => {
    const appSource = readFileSync(resolve('src/main.ts'), 'utf8');
    const design = readFileSync(resolve('.factory/design.md'), 'utf8');
    const asset = readFileSync(resolve('public/assets/forge-blueprint.webp'));
    expect(appSource).toContain('Blueprint illustration uses original generated imagery.');
    expect(appSource).toContain('src="/assets/forge-blueprint.webp"');
    expect(asset.byteLength).toBeGreaterThan(1_000);
    expect(design).toContain('Generated image provenance is disclosed in the footer.');
    expect(design).toContain('Constraints: no text, no numerals, no watermark, no');
    expect(design).toContain('> logo, no people, no copyrighted objects.');
  });

  it('regression: the real 404 ships the standard header, navigation, footer, and metadata', () => {
    const page = readFileSync(resolve('public/404.html'), 'utf8');
    expect(page).toContain('<a class="skip" href="#main">Skip to game</a>');
    expect(page).toContain('<nav aria-label="Primary">');
    expect(page).toContain('href="/demo"');
    expect(page).toContain('href="/privacy"');
    expect(page).toContain('href="/terms"');
    expect(page).toContain('Built by Param Factory · v4.0.0');
    expect(page).toContain('rel="canonical"');
  });
});

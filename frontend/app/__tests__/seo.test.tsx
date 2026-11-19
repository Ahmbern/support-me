import { describe, it, expect } from 'vitest';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { metadata as dashboardMeta } from '@/app/dashboard/layout';
import { metadata as settingsMeta } from '@/app/settings/layout';
import { metadata as adminMeta } from '@/app/admin/layout';
import { metadata as activityMeta } from '@/app/activity/layout';
import { metadata as appMeta } from '@/app/app/layout';
import { metadata as authMeta } from '@/app/auth/layout';
import { metadata as rootMeta } from '@/app/layout';

describe('SEO & Robots Directives', () => {
  it('disallows index and follow on private layouts', () => {
    const layouts = [
      { name: 'dashboard', meta: dashboardMeta },
      { name: 'settings', meta: settingsMeta },
      { name: 'admin', meta: adminMeta },
      { name: 'activity', meta: activityMeta },
      { name: 'app', meta: appMeta },
      { name: 'auth', meta: authMeta },
    ];

    layouts.forEach(({ name, meta }) => {
      expect(meta.robots, `${name} layout should disallow search engine indexing`).toEqual({
        index: false,
        follow: false,
      });
    });
  });

  it('allows index and follow on root layout', () => {
    expect(rootMeta.robots).toEqual({
      index: true,
      follow: true,
    });
    expect(rootMeta.alternates).toEqual({
      canonical: '/',
    });
  });

  it('generates consistent robots.txt configuration', () => {
    const config = robots();
    expect(config.rules).toBeDefined();

    const rules = Array.isArray(config.rules) ? config.rules[0] : config.rules;
    expect(rules.userAgent).toBe('*');
    expect(rules.disallow).toContain('/dashboard');
    expect(rules.disallow).toContain('/settings');
    expect(rules.disallow).toContain('/admin');
    expect(rules.disallow).toContain('/activity');
    expect(rules.disallow).toContain('/app');
    expect(rules.allow).toContain('/');
    expect(rules.allow).not.toContain('/donate');
    // The bracketed Next.js dynamic segment is a literal path that matches
    // nothing in robots.txt and must not be advertised (#451).
    expect(rules.allow).not.toContain('/[username]');
    expect(rules.disallow).toContain('/receipt');
  });

  it('generates valid sitemap for public routes', () => {
    const map = sitemap();
    expect(map.length).toBeGreaterThan(0);
    expect(map.some((entry) => entry.url.endsWith('/'))).toBe(true);
    expect(map.some((entry) => entry.url.endsWith('/discover'))).toBe(true);
    expect(map.some((entry) => entry.url.endsWith('/donate'))).toBe(false);
  });

  it('uses stable lastModified values across requests (#451)', () => {
    const first = sitemap();
    const second = sitemap();

    expect(first.map((entry) => entry.lastModified)).toEqual(
      second.map((entry) => entry.lastModified)
    );
    // A fixed timestamp, not "now" on each call.
    expect(new Date(first[0].lastModified as string).toISOString()).toBe(
      '2026-09-01T00:00:00.000Z'
    );
  });
});

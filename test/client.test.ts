import assert from 'node:assert/strict';
import test from 'node:test';
import { WaniKaniClient } from '../src/client.js';

test('sends authentication, revision, and comma-delimited filters', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    assert.equal(String(input), 'https://example.test/v2/subjects?levels=1%2C2&hidden=false');
    const headers = new Headers(init?.headers);
    assert.equal(headers.get('authorization'), 'Bearer secret');
    assert.equal(headers.get('wanikani-revision'), '20170710');
    return new Response(JSON.stringify({ data: [] }));
  };

  try {
    assert.deepEqual(
      await new WaniKaniClient('secret', 'https://example.test/v2').request('/subjects', {
        levels: [1, 2], hidden: false,
      }),
      { data: [] },
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('reports API errors without echoing response bodies or tokens', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(
    JSON.stringify({ error: 'Unauthorized', debug: 'secret response detail' }),
    { status: 401 },
  );

  try {
    await assert.rejects(
      new WaniKaniClient('secret', 'https://example.test/v2').request('/user'),
      /^Error: WaniKani API 401: Unauthorized$/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('rejects non-HTTPS remote API base URLs', () => {
  assert.throws(
    () => new WaniKaniClient('secret', 'http://example.test/v2'),
    /must use HTTPS/,
  );
});

test('enforces the subscription level before requesting subject content', async () => {
  const originalFetch = globalThis.fetch;
  const requests: string[] = [];
  globalThis.fetch = async (input) => {
    requests.push(String(input));
    return new Response(JSON.stringify({ data: { subscription: { max_level_granted: 3 } } }));
  };

  try {
    await assert.rejects(
      new WaniKaniClient('secret', 'https://example.test/v2').listSubjects({ levels: [4] }),
      /permits subjects through level 3/,
    );
    assert.deepEqual(requests, ['https://example.test/v2/user']);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('does not return a singular subject above the subscription level', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => String(input).endsWith('/user')
    ? new Response(JSON.stringify({ data: { subscription: { max_level_granted: 3 } } }))
    : new Response(JSON.stringify({ data: { level: 4 } }));

  try {
    await assert.rejects(
      new WaniKaniClient('secret', 'https://example.test/v2').getResource('subjects', 99),
      /permits subjects through level 3/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('turns a non-JSON rate-limit response into a bounded error', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('proxy details', {
    status: 429,
    statusText: 'Too Many Requests',
  });

  try {
    await assert.rejects(
      new WaniKaniClient('secret', 'https://example.test/v2').request('/summary'),
      /^Error: WaniKani API 429: Too Many Requests$/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

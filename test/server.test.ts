import assert from 'node:assert/strict';
import test from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { WaniKaniClient } from '../src/client.js';
import { createServer } from '../src/server.js';

const publishedTools = [
  'get_resource', 'get_summary', 'get_user', 'list_assignments', 'list_level_progressions',
  'list_resets', 'list_review_statistics', 'list_reviews', 'list_spaced_repetition_systems',
  'list_study_materials', 'list_subjects', 'list_voice_actors',
];

test('exposes the complete read-only tool inventory', async () => {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createServer(new WaniKaniClient('test', 'https://example.test/v2'));
  const client = new Client({ name: 'test', version: '1.0.0' });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  try {
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map(({ name }) => name).sort(), publishedTools);
    assert.ok(tools.every(({ annotations: value }) => value?.readOnlyHint && value.idempotentHint));
  } finally {
    await Promise.all([client.close(), server.close()]);
  }
});

test('validates and serializes subject filters at the MCP boundary', async () => {
  const originalFetch = globalThis.fetch;
  const requests: string[] = [];
  globalThis.fetch = async (input) => {
    const url = String(input);
    requests.push(url);
    if (url.endsWith('/user')) {
      return new Response(JSON.stringify({ data: { subscription: { max_level_granted: 10 } } }));
    }
    return new Response(JSON.stringify({ data: [] }));
  };
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createServer(new WaniKaniClient('test', 'https://example.test/v2'));
  const client = new Client({ name: 'test', version: '1.0.0' });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  try {
    await client.callTool({ name: 'list_subjects', arguments: { levels: [1, 2], types: ['kanji'] } });
    assert.deepEqual(requests, [
      'https://example.test/v2/user',
      'https://example.test/v2/subjects?types=kanji&levels=1%2C2',
    ]);
    const invalid = await client.callTool({ name: 'get_resource', arguments: { resource: 'user', id: 1 } });
    assert.equal(invalid.isError, true);
  } finally {
    globalThis.fetch = originalFetch;
    await Promise.all([client.close(), server.close()]);
  }
});

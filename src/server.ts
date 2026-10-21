import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { WaniKaniClient, type QueryValue } from './client.js';

const annotations = { readOnlyHint: true, idempotentHint: true, openWorldHint: true };
const positiveIds = z.array(z.number().int().positive()).min(1).max(1000).optional();
const commonCollectionSchema = {
  ids: positiveIds,
  updated_after: z.iso.datetime({ offset: true }).optional(),
  page_after_id: z.number().int().positive().optional(),
  page_before_id: z.number().int().positive().optional(),
};

type ToolArgs = Record<string, QueryValue>;

export function createServer(client: WaniKaniClient): McpServer {
  const server = new McpServer({ name: 'kani-mcp-server', version: '0.1.0' });
  const result = async (request: Promise<unknown>) => {
    try {
      const data = await request;
      return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text' as const, text: error instanceof Error ? error.message : String(error) }],
      };
    }
  };

  server.registerTool('get_user', {
    description: 'Get the authenticated WaniKani user profile and subscription state',
    annotations,
  }, () => result(client.request('/user')));

  server.registerTool('get_summary', {
    description: 'Get lesson and review availability for the next 24 hours',
    annotations,
  }, () => result(client.request('/summary')));

  const collectionTools = {
    list_level_progressions: ['/level_progressions', 'List level progression history'],
    list_resets: ['/resets', 'List account reset history'],
    list_reviews: ['/reviews', 'List completed reviews'],
    list_spaced_repetition_systems: ['/spaced_repetition_systems', 'List spaced repetition system definitions'],
    list_study_materials: ['/study_materials', 'List user notes and synonyms'],
    list_voice_actors: ['/voice_actors', 'List pronunciation voice actors'],
  } as const;

  for (const [name, [path, description]] of Object.entries(collectionTools)) {
    server.registerTool(name, { description, inputSchema: commonCollectionSchema, annotations },
      (args) => result(client.request(path, args as ToolArgs)));
  }

  server.registerTool('list_assignments', {
    description: 'List assignments with optional subject, level, SRS, and availability filters',
    inputSchema: {
      ...commonCollectionSchema,
      subject_ids: positiveIds,
      subject_types: z.array(z.enum(['radical', 'kanji', 'vocabulary', 'kana_vocabulary'])).min(1).optional(),
      levels: z.array(z.number().int().min(1).max(60)).min(1).optional(),
      srs_stages: z.array(z.number().int().min(0).max(9)).min(1).optional(),
      unlocked: z.boolean().optional(),
      started: z.boolean().optional(),
      passed: z.boolean().optional(),
      burned: z.boolean().optional(),
      hidden: z.boolean().optional(),
      available_after: z.iso.datetime({ offset: true }).optional(),
      available_before: z.iso.datetime({ offset: true }).optional(),
      immediately_available_for_lessons: z.boolean().optional(),
      immediately_available_for_review: z.boolean().optional(),
    },
    annotations,
  }, (args) => result(client.request('/assignments', args)));

  server.registerTool('list_review_statistics', {
    description: 'List accuracy statistics for studied subjects',
    inputSchema: {
      ...commonCollectionSchema,
      subject_ids: positiveIds,
      subject_types: z.array(z.enum(['radical', 'kanji', 'vocabulary', 'kana_vocabulary'])).min(1).optional(),
      percentages_greater_than: z.number().int().min(0).max(100).optional(),
      percentages_less_than: z.number().int().min(0).max(100).optional(),
    },
    annotations,
  }, (args) => result(client.request('/review_statistics', args)));

  server.registerTool('list_subjects', {
    description: 'List radicals, kanji, and vocabulary with optional level, type, or slug filters',
    inputSchema: {
      ...commonCollectionSchema,
      types: z.array(z.enum(['radical', 'kanji', 'vocabulary', 'kana_vocabulary'])).min(1).optional(),
      slugs: z.array(z.string().min(1)).min(1).max(1000).optional(),
      levels: z.array(z.number().int().min(1).max(60)).min(1).optional(),
      hidden: z.boolean().optional(),
    },
    annotations,
  }, (args) => result(client.listSubjects(args)));

  server.registerTool('get_resource', {
    description: 'Get one WaniKani resource by type and numeric ID',
    inputSchema: {
      resource: z.enum([
        'assignments', 'level_progressions', 'resets', 'reviews', 'review_statistics',
        'spaced_repetition_systems', 'study_materials', 'subjects', 'voice_actors',
      ]),
      id: z.number().int().positive(),
    },
    annotations,
  }, ({ resource, id }) => result(client.getResource(resource, id)));

  return server;
}

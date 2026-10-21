const DEFAULT_BASE_URL = 'https://api.wanikani.com/v2';
const API_REVISION = '20170710';

export type QueryValue = string | number | boolean | readonly (string | number)[] | undefined;

export class WaniKaniClient {
  private readonly baseUrl: string;

  constructor(
    private readonly token: string,
    baseUrl = DEFAULT_BASE_URL,
  ) {
    const parsed = new URL(baseUrl);
    if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
      throw new Error('WANIKANI_API_BASE_URL must use HTTPS unless it targets localhost');
    }
    this.baseUrl = parsed.toString().replace(/\/$/, '');
  }

  async request(path: string, query: Record<string, QueryValue> = {}): Promise<unknown> {
    const url = new URL(`${this.baseUrl}${path}`);
    for (const [name, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(name, Array.isArray(value) ? value.join(',') : String(value));
    }

    const response = await fetch(url, { headers: {
      Authorization: `Bearer ${this.token}`,
      Accept: 'application/json',
      'Wanikani-Revision': API_REVISION,
    } });
    const text = await response.text();
    if (!response.ok) {
      let detail = response.statusText;
      try {
        const body = JSON.parse(text) as { error?: unknown };
        if (typeof body.error === 'string') detail = body.error;
      } catch {}
      throw new Error(`WaniKani API ${response.status}${detail ? `: ${detail}` : ''}`);
    }
    return text ? JSON.parse(text) : null;
  }

  async listSubjects(query: Record<string, QueryValue>): Promise<unknown> {
    const maxLevel = await this.maxLevelGranted();
    const requested = query.levels as readonly number[] | undefined;
    const levels = requested ?? Array.from({ length: maxLevel }, (_, index) => index + 1);
    if (levels.some((level) => level > maxLevel)) {
      throw new Error(`WaniKani subscription permits subjects through level ${maxLevel}`);
    }
    return this.request('/subjects', { ...query, levels });
  }

  async getResource(resource: string, id: number): Promise<unknown> {
    const value = await this.request(`/${resource}/${id}`);
    if (resource === 'subjects') {
      const level = (value as { data?: { level?: unknown } }).data?.level;
      const maxLevel = await this.maxLevelGranted();
      if (typeof level === 'number' && level > maxLevel) {
        throw new Error(`WaniKani subscription permits subjects through level ${maxLevel}`);
      }
    }
    return value;
  }

  private async maxLevelGranted(): Promise<number> {
    const user = await this.request('/user') as { data?: { subscription?: { max_level_granted?: unknown } } };
    const maxLevel = user.data?.subscription?.max_level_granted;
    if (typeof maxLevel !== 'number') throw new Error('WaniKani user response omitted max_level_granted');
    return maxLevel;
  }
}

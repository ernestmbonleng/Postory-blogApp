const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not set');
}

console.log('Search Service Initialized');
console.log('API_URL:', API_URL);

export type SearchType = 'user' | 'post' | 'tag' | 'category';

interface SearchParams {
  q: string;
  limit?: number;
  type?: SearchType;
}

interface SearchSuggestion {
  type: SearchType;
  text: string;
  score: number;
  data: Record<string, unknown>;
}

interface SearchResponse {
  suggestions: SearchSuggestion[];
}

interface QuickSearchResponse {
  results: SearchSuggestion[];
}

interface PopularSearchItem {
  query: string;
  count: number;
}

interface DailySearchAnalytics {
  date: string;
  queries: Record<string, number>;
}

export async function fetchSearchSuggestions({
  q,
  limit = 5,
  type,
}: SearchParams): Promise<SearchResponse> {
  console.log(' fetchSearchSuggestions called with:', { q, limit, type });

  const params = new URLSearchParams({ q });

  if (limit) params.append('limit', String(limit));
  if (type) params.append('type', type);

  const url = `${API_URL}/search/suggestions?${params.toString()}`;
  console.log('Making request to:', url);

  try {
    console.log(' Starting fetch request...');
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Response status:', res.status, res.statusText);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Response not OK:', errorText);
      throw new Error(`Search failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Search response data:', data);
    console.log('Suggestions count:', data.suggestions?.length || 0);

    return data;
  } catch (error) {
    console.error('Search fetch error:', error);
    return { suggestions: [] };
  }
}
export async function fetchQuickSearch(query: string): Promise<QuickSearchResponse> {
  console.log(' fetchQuickSearch called with:', query);

  if (!query || query.trim().length < 2) {
    console.log(' Query too short, returning empty results');
    return { results: [] };
  }

  const url = `${API_URL}/search/quick?q=${encodeURIComponent(query)}`;
  console.log(' Quick search URL:', url);

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log(' Quick search status:', res.status, res.statusText);

    if (!res.ok) {
      throw new Error(`Quick search failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log(' Quick search results:', data.results?.length || 0);

    return data;
  } catch (error) {
    console.error('Quick search error:', error);
    return { results: [] };
  }
}

export async function fetchPopularSearches(limit: number = 10): Promise<PopularSearchItem[]> {
  console.log('fetchPopularSearches called with limit:', limit);

  const url = `${API_URL}/search/popular${limit ? `?limit=${limit}` : ''}`;
  console.log(' Popular searches URL:', url);

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Popular searches status:', res.status, res.statusText);

    if (!res.ok) {
      throw new Error(`Popular searches failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Popular searches count:', data.length || 0);

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Popular searches error:', error);
    return [];
  }
}


export async function fetchSearchAnalytics(days: number = 7): Promise<DailySearchAnalytics[]> {
  console.log('fetchSearchAnalytics called with days:', days);

  const url = `${API_URL}/search/analytics?days=${days}`;
  console.log('Search analytics URL:', url);

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log(' Search analytics status:', res.status, res.statusText);
    
    if (!res.ok) {
      throw new Error(`Search analytics failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Search analytics days:', data.length || 0);

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Search analytics error:', error);
    return [];
  }
}

export interface AllSearchResults {
  suggestions: SearchSuggestion[];
  quickResults: SearchSuggestion[];
  popular: PopularSearchItem[];
  analytics: DailySearchAnalytics[];
}

export async function fetchAllSearchData(query?: string): Promise<AllSearchResults> {
  console.log(' fetchAllSearchData called with query:', query || 'none');

  try {
    const [suggestions, quickResults, popular, analytics] = await Promise.all([
      query && query.length >= 2
        ? fetchSearchSuggestions({ q: query, limit: 10 })
        : Promise.resolve({ suggestions: [] }),

      query && query.length >= 2
        ? fetchQuickSearch(query)
        : Promise.resolve({ results: [] }),

      fetchPopularSearches(10),
      fetchSearchAnalytics(7),
    ]);

    return {
      suggestions: suggestions.suggestions || [],
      quickResults: quickResults.results || [],
      popular: popular,
      analytics: analytics,
    };
  } catch (error) {
    console.error('fetchAllSearchData error:', error);
    return {
      suggestions: [],
      quickResults: [],
      popular: [],
      analytics: [],
    };
  }
}

export interface SearchOptions {
  query: string;
  limit?: number;
  type?: SearchType;
  includeQuick?: boolean;
  includePopular?: boolean;
  includeAnalytics?: boolean;
}

export async function search(options: SearchOptions): Promise<{
  suggestions: SearchSuggestion[];
  quickResults?: SearchSuggestion[];
  popular?: PopularSearchItem[];
  analytics?: DailySearchAnalytics[];
}> {
  const { query, limit = 10, type, includeQuick, includePopular, includeAnalytics } = options;

  if (!query || query.trim().length < 2) {
    return { suggestions: [] };
  }

  try {
    const [suggestions, quickResults, popular, analytics] = await Promise.all([
      fetchSearchSuggestions({ q: query, limit, type }),

      includeQuick ? fetchQuickSearch(query) : Promise.resolve(null),
      includePopular ? fetchPopularSearches(5) : Promise.resolve(null),
      includeAnalytics ? fetchSearchAnalytics(7) : Promise.resolve(null),
    ]);

    return {
      suggestions: suggestions.suggestions || [],
      ...(includeQuick && { quickResults: quickResults?.results || [] }),
      ...(includePopular && { popular: popular || [] }),
      ...(includeAnalytics && { analytics: analytics || [] }),
    };
  } catch (error) {
    console.error(' Search error:', error);
    return { suggestions: [] };
  }
}

export type {
  SearchSuggestion,
  PopularSearchItem,
  DailySearchAnalytics,
};
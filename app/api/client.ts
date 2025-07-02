import type { ApiFilters, ListTransactionsResponse } from './types';

export class UpApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey: string, baseUrl = 'https://api.up.com.au/api/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Fetches transactions for a specific account with optional filters
   */
  async getTransactions(
    filters: ApiFilters = {},
    pageSize = 30,
  ): Promise<ListTransactionsResponse> {
    const url = new URL(`${this.baseUrl}/transactions`);

    // Add pagination
    url.searchParams.set('page[size]', pageSize.toString());

    // Add filters as query parameters
    if (filters.since) {
      url.searchParams.set('filter[since]', filters.since);
    }

    if (filters.until) {
      url.searchParams.set('filter[until]', filters.until);
    }

    if (filters.status) {
      url.searchParams.set('filter[status]', filters.status);
    }

    if (filters.category) {
      url.searchParams.set('filter[category]', filters.category);
    }

    if (filters.tag) {
      url.searchParams.set('filter[tag]', filters.tag);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }

  /**
   * Fetches all transactions for an account, handling pagination automatically
   */
  async getAllTransactions(
    filters: ApiFilters = {},
  ): Promise<ListTransactionsResponse> {
    let allTransactions: ListTransactionsResponse['data'] = [];
    let currentUrl: string | null = null;
    let pageCount = 0;
    const maxPages = 20; // Reasonable limit to prevent excessive API calls

    do {
      const response = currentUrl
        ? await this.fetchPage(currentUrl)
        : await this.getTransactions(filters);

      allTransactions = allTransactions.concat(response.data);
      currentUrl = response.links.next;
      pageCount++;

      // Safety check to prevent excessive API calls
      if (pageCount >= maxPages) {
        console.warn(
          `Reached maximum page limit (${maxPages}). Fetched ${allTransactions.length} transactions.`,
        );
        break;
      }
    } while (currentUrl);

    return {
      data: allTransactions,
      links: {
        prev: null,
        next: currentUrl,
      },
    };
  }

  /**
   * Fetches a specific page using the provided URL
   */
  private async fetchPage(url: string): Promise<ListTransactionsResponse> {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }
}

// Factory function to create API client with environment-based configuration
export function getApiClient(): UpApiClient {
  const apiKey = process.env.UP_API_KEY;

  if (!apiKey) {
    throw new Error('UP_API_KEY environment variable is required');
  }

  return new UpApiClient(apiKey);
}

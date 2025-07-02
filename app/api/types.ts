// Transaction data types based on the API response structure

export interface Transaction {
  id: string;
  type: 'transactions';
  attributes: {
    status: 'HELD' | 'SETTLED';
    rawText: string | null;
    description: string;
    message: string | null;
    amount: {
      currencyCode: string;
      value: string;
      valueInBaseUnits: number;
    };
    settledAt: string | null;
    createdAt: string;
    note: string | null;
    transactionType: string | null;
  };
  relationships: {
    account: {
      data: {
        type: 'accounts';
        id: string;
      };
    };
    category: {
      data: {
        type: 'categories';
        id: string;
      } | null;
    };
    parentCategory: {
      data: {
        type: 'categories';
        id: string;
      } | null;
    };
    tags: {
      data: Array<{
        type: 'tags';
        id: string;
      }>;
    };
  };
}

export interface ListTransactionsResponse {
  data: Transaction[];
  links: {
    prev: string | null;
    next: string | null;
  };
}

// API filter parameters that can be passed to the UP API
export interface ApiFilters {
  since?: string; // ISO date-time
  until?: string; // ISO date-time
  status?: 'HELD' | 'SETTLED';
  category?: string; // category ID
  tag?: string; // tag name
}

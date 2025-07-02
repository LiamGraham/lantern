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

export const categoryLookup = {
  'games-and-software': 'Apps, Games & Software',
  'car-insurance-and-maintenance': 'Car Insurance, Rego & Maintenance',
  family: 'Children & Family',
  'good-life': 'Good Life',
  groceries: 'Groceries',
  booze: 'Booze',
  'clothing-and-accessories': 'Clothing & Accessories',
  cycling: 'Cycling',
  'homeware-and-appliances': 'Homeware & Appliances',
  personal: 'Personal',
  'education-and-student-loans': 'Education & Student Loans',
  'events-and-gigs': 'Events & Gigs',
  fuel: 'Fuel',
  home: 'Home',
  internet: 'Internet',
  'fitness-and-wellbeing': 'Fitness & Wellbeing',
  hobbies: 'Hobbies',
  'home-maintenance-and-improvements': 'Maintenance & Improvements',
  parking: 'Parking',
  transport: 'Transport',
  'gifts-and-charity': 'Gifts & Charity',
  'holidays-and-travel': 'Holidays & Travel',
  pets: 'Pets',
  'public-transport': 'Public Transport',
  'hair-and-beauty': 'Hair & Beauty',
  'lottery-and-gambling': 'Lottery & Gambling',
  'home-insurance-and-rates': 'Rates & Insurance',
  'car-repayments': 'Repayments',
  'health-and-medical': 'Health & Medical',
  'pubs-and-bars': 'Pubs & Bars',
  'rent-and-mortgage': 'Rent & Mortgage',
  'taxis-and-share-cars': 'Taxis & Share Cars',
  investments: 'Investments',
  'restaurants-and-cafes': 'Restaurants & Cafes',
  'toll-roads': 'Tolls',
  utilities: 'Utilities',
  'life-admin': 'Life Admin',
  takeaway: 'Takeaway',
  'mobile-phone': 'Mobile Phone',
  'tobacco-and-vaping': 'Tobacco & Vaping',
  'news-magazines-and-books': 'News, Magazines & Books',
  'tv-and-music': 'TV, Music & Streaming',
  adult: 'Adult',
  technology: 'Technology',
} as const;

# Lantern

## Query DSL

Queries are boolean expressions consisting of combinations of filters and operators (conjunctions and disjunctions, or ANDs and ORs).

Filters are atomic predicates that evaluate to true or false based on a comparison between a transaction field and a specified value. An individual transaction
will be yielded by a given query if it satisifies the combination of filters in that query.

### Filter Syntax

Filters take the form `key:value`. The available filter keys are:

- `since` (datetime) - transactions on or after this date
- `until` (datetime) - transactions on or before this date  
- `category` (pattern) - transaction category
- `status` (pattern) - transaction status
- `amount` (range) - transaction amount with optional comparison operators
- `description` (pattern) - transaction description with optional wildcard matching
- `account` (pattern) - source account

Some keys map directly to filters exposed by the UP API and may be passed as API query parameters, whereas others are
applied post-retrieval.

### Value Types

- **Range**: Either a plain numerical value that maps to singleton set, or a numerical comparison that maps onto some set of real numbers
  - `10` → `{10}`
  - `>10` → `(10, +∞)`
  - `<=50` → `(-∞, 50]`
  - `10..100` → `[10, 100]`

- **Pattern**: A wildcard expression, either a plain string (exact match) or combination of characters and wildcards
  - `dining` → exact match
  - `*coffee*` → contains "coffee"
  - `starbucks*` → starts with "starbucks"

- **Datetime**: ISO format or relative expressions
  - `2024-01-15` → specific date
  - `7d` → 7 days ago
  - `1m` → 1 month ago

### Query Composition

A basic query consists of a sequence of whitespace-separated filters. In the absence of an explicit `AND` or `OR` operator, two
whitespace-separated filters is parsed as a conjunction of those filters. Sub-queries may also be grouped using
parentheses to modify how the expression will be evaluated (e.g. `(category:personal AND amount:>10) OR (category:home
AND amount:>30)`).

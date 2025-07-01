import { type JSX, useId, useState } from 'react';
import { useFetcher } from 'react-router';
import { validateQuery } from '~/dsl/parser';
import { lexer } from '../dsl/lexer';
import { parseQuery, type QueryNode } from '../dsl/parser';
import type { QueryResult } from '../dsl/service';

export function QueryPlayground() {
  const [query, setQuery] = useState('');
  const [excludeCredits, setExcludeCredits] = useState(true);
  const fetcher = useFetcher();

  const tokenizeQuery = (inputQuery: string) => {
    if (!inputQuery.trim()) return [];

    try {
      const result = lexer.tokenize(inputQuery);
      return result.tokens;
    } catch (error) {
      console.error('Tokenization error:', error);
      return [];
    }
  };

  const parseQueryString = (inputQuery: string) => {
    if (!inputQuery.trim()) return { ast: null, errors: [] };

    try {
      const ast = parseQuery(inputQuery);
      return { ast, errors: [] };
    } catch (error) {
      console.error('Parsing error:', error);
      return {
        ast: null,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  };

  const buildFinalQuery = () => {
    let finalQuery = query.trim();

    if (excludeCredits && finalQuery) {
      finalQuery = `${finalQuery} debit:true`;
    } else if (excludeCredits) {
      finalQuery = 'debit:true';
    }

    return finalQuery;
  };

  const handleExecuteQuery = () => {
    const finalQuery = buildFinalQuery();
    if (!finalQuery) return;

    const formData = new FormData();
    formData.set('query', finalQuery);

    fetcher.submit(formData, { method: 'POST' });
  };

  const finalQuery = buildFinalQuery();
  const tokens = tokenizeQuery(finalQuery);
  const parseResult = parseQueryString(finalQuery);
  const ast = parseResult.ast;
  const parseErrors = parseResult.errors;
  const validation = validateQuery(finalQuery);
  const inputId = useId();

  // Extract state from fetcher
  const isExecuting = fetcher.state === 'submitting';
  const queryResult =
    fetcher.data && !fetcher.data.error ? (fetcher.data as QueryResult) : null;
  const executionError = fetcher.data?.error || null;

  // Helper function to render AST nodes recursively
  const renderASTNode = (node: QueryNode, depth = 0): JSX.Element => {
    if (node.type === 'filter') {
      return (
        <div key={Math.random()} className="py-1">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-800 text-green-100">
              Filter
            </span>
            {node.negated && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-red-600 text-red-100 font-bold">
                NOT
              </span>
            )}
            <span className="font-mono text-sm">
              <span className="text-blue-400">{node.field}</span>
              <span className="text-gray-500">:</span>
              <span className="text-purple-500">{node.value}</span>
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-600 text-gray-100">
              {node.valueType}
            </span>
          </div>
        </div>
      );
    } else {
      return (
        <div key={Math.random()} className="py-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-700 text-orange-100">
              {node.operator}
            </span>
            {node.negated && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-red-600 text-red-100 font-bold">
                NOT
              </span>
            )}
          </div>
          <div className="ml-4 border-l-2 border-neutral-600 pl-2">
            {renderASTNode(node.left, depth + 1)}
            {renderASTNode(node.right, depth + 1)}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Query Playground</h1>
      </div>

      {/* Query Input */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="query" className="block text-sm font-medium">
            Query
          </label>
          <input
            id={inputId}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. category:dining amount:>50 since:7d"
            className="w-full px-3 py-2 border border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="exclude-credits"
                checked={excludeCredits}
                onChange={(e) => setExcludeCredits(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="exclude-credits" className="text-sm font-medium">
                Exclude credits
              </label>
            </div>

            <button
              type="button"
              onClick={handleExecuteQuery}
              disabled={!finalQuery || !validation.isValid || isExecuting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExecuting ? 'Executing...' : 'Execute Query'}
            </button>

            {!validation.isValid && finalQuery && (
              <div className="text-red-600 text-sm">
                Invalid query: {validation.error}
              </div>
            )}

            {executionError && (
              <div className="text-red-600 text-sm">
                Execution failed: {executionError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Example Queries */}
      <div className="space-y-2">
        <h3 className="text-md font-medium">Example Queries</h3>
        <div className="flex flex-wrap gap-2">
          {[
            'category:*dining* amount:>50',
            'since:2024-01-01 until:2024-01-31',
            'description:"coffee shop" OR category:transport',
            'debit:true amount:>100',
            'credit:true !type:transfer',
            'category:food* debit:true since:7d',
            '!(category:transfer OR type:transfer)',
            'amount:>100 !(status:pending OR description:*refund*)',
          ].map((example) => (
            <button
              type="button"
              key={example}
              onClick={() => setQuery(example)}
              className="px-3 py-1 text-sm hover:bg-gray-200 rounded-md border border-neutral-600 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Query Results */}
      {queryResult && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Query Results</h3>

          {/* Execution Info */}
          <div className="bg-neutral-600 border border-neutral-600  rounded-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Fetched:</span>{' '}
                {queryResult.metadata.totalFetched}
              </div>
              <div>
                <span className="font-medium">Total Filtered:</span>{' '}
                {queryResult.metadata.totalFiltered}
              </div>
              <div>
                <span className="font-medium">Date Bounds:</span>{' '}
                {queryResult.metadata.dateBounds.since ||
                queryResult.metadata.dateBounds.until
                  ? `${queryResult.metadata.dateBounds.since ? new Date(queryResult.metadata.dateBounds.since).toLocaleDateString() : 'No start'} - ${queryResult.metadata.dateBounds.until ? new Date(queryResult.metadata.dateBounds.until).toLocaleDateString() : 'No end'}`
                  : 'No date filters'}
              </div>
            </div>
          </div>

          {/* Transactions */}
          {queryResult.transactions.length === 0 ? (
            <div className="border border-neutral-600 rounded-md p-8 text-center text-gray-500">
              No transactions found matching the query
            </div>
          ) : (
            <div className="border border-neutral-600 rounded-md overflow-hidden">
              <div className="bg-neutral-700 px-4 py-2 border-b border-neutral-600">
                <p className="text-sm font-medium">
                  {queryResult.transactions.length} transaction
                  {queryResult.transactions.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="divide-y divide-neutral-600 max-h-96 overflow-y-auto">
                {queryResult.transactions.map((transaction) => (
                  <div key={transaction.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">
                            {transaction.attributes.description}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              transaction.attributes.status === 'SETTLED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {transaction.attributes.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-300 space-y-1">
                          <div>
                            <span className="font-medium">Category:</span>{' '}
                            {transaction.relationships.category.data?.id ||
                              'Uncategorized'}
                          </div>
                          <div>
                            <span className="font-medium">Account:</span>{' '}
                            {transaction.relationships.account.data.id}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span>{' '}
                            {new Date(
                              transaction.attributes.createdAt,
                            ).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Type:</span>{' '}
                            {transaction.attributes.transactionType ||
                              'Unknown'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-medium ${
                            transaction.attributes.amount.valueInBaseUnits < 0
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}
                        >
                          {transaction.attributes.amount.value}{' '}
                          {transaction.attributes.amount.currencyCode}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lexer Output */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Lexer Output</h2>

          {query.trim() === '' ? (
            <div className="border border-neutral-600 rounded-md p-4">
              <p className="italic">Enter a query to see tokens</p>
            </div>
          ) : tokens.length === 0 ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">No valid tokens found</p>
            </div>
          ) : (
            <div className="border border-neutral-600 rounded-md overflow-hidden">
              <div className="bg-neutral-700 px-4 py-2 border-b border-neutral-600">
                <p className="text-sm font-medium">
                  {tokens.length} token{tokens.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="divide-y divide-neutral-600 max-h-64 overflow-y-auto">
                {tokens.map((token, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-700 text-blue-100">
                        {token.tokenType.name}
                      </span>
                      <span className="font-mono text-sm">"{token.image}"</span>
                    </div>
                    <div className="text-xs text-gray-200">
                      {token.startOffset}-{token.endOffset}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Parser Output */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Parser Output (AST)</h2>

          {query.trim() === '' ? (
            <div className="border border-neutral-600 rounded-md p-4">
              <p className="italic">Enter a query to see AST</p>
            </div>
          ) : !ast ? (
            <div className="bg-red-500 border border-red-700 rounded-md p-4">
              <p>Failed to parse query</p>
              {parseErrors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-red-700">Errors:</p>
                  <ul className="mt-1 text-sm text-red-600">
                    {parseErrors.map((error, index) => (
                      <li key={index} className="font-mono">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-neutral-600 rounded-md overflow-hidden">
              <div className="bg-neutral-700 px-4 py-2 border-b border-neutral-600">
                <p className="text-sm font-medium">Abstract Syntax Tree</p>
              </div>
              <div className="p-4 max-h-64 overflow-y-auto">
                {renderASTNode(ast)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* JSON Output (for debugging) */}
      {ast && (
        <div className="space-y-2">
          <h3 className="text-md font-medium">JSON Output</h3>
          <div className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-x-auto">
            <pre className="text-xs">{JSON.stringify(ast, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

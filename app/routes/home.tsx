import { QueryPlayground } from "../playground/playground";
import type { Route } from "./+types/home";
import { parseQuery } from "../dsl/parser";
import { extractDateBounds, evaluateQuery } from "../dsl/executor";
import { createApiClient } from "../api/client";

export function meta({}: Route.MetaArgs) {
	return [{ title: "Lantern" }, { name: "description", content: "Lantern" }];
}

export async function action({ request }: Route.ActionArgs) {
	if (request.method !== "POST") {
		throw new Response("Method not allowed", { status: 405 });
	}

	const formData = await request.formData();
	const queryString = formData.get("query") as string;

	if (!queryString) {
		return Response.json(
			{ error: "Query and account ID are required" },
			{ status: 400 }
		);
	}

	try {
		// Parse the query string into an AST
		const ast = parseQuery(queryString);
		
		if (!ast) {
			return Response.json(
				{ error: "Failed to parse query" },
				{ status: 400 }
			);
		}

		// Extract date bounds to optimize the API call
		const dateBounds = extractDateBounds(ast);
		
		// Create API client and fetch data using date filters to bound the dataset
		const apiClient = createApiClient();
		const response = await apiClient.getAllTransactions(dateBounds);

		// Apply the full query logic client-side
		const filteredTransactions = evaluateQuery(ast, response.data);

		return Response.json({
			transactions: filteredTransactions,
			executionInfo: {
				dateBounds,
				totalFetched: response.data.length,
				totalFiltered: filteredTransactions.length,
			},
		});
	} catch (error) {
		console.error("Query execution error:", error);
		return Response.json(
			{ error: error instanceof Error ? error.message : "Query execution failed" },
			{ status: 500 }
		);
	}
}

export default function Home() {
	return <QueryPlayground />;
}

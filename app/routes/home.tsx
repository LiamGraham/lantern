import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
	return [{ title: "Lantern" }, { name: "description", content: "Lantern" }];
}

export default function Home() {
	return (
		<div>
			<h1>Lantern</h1>
		</div>
	);
}

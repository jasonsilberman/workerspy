import { Link } from "@remix-run/react";

export function Navbar() {
	return (
		<nav className="border-b">
			<div className="container mx-auto px-4 py-4">
				<Link to="/" className="text-2xl font-bold">
					Workerspy
				</Link>
			</div>
		</nav>
	);
}

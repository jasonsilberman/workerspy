export function Headers({ headers }: { headers: Record<string, string> }) {
	return (
		<div className="bg-white rounded border overflow-hidden">
			<pre className="p-4 text-sm overflow-auto">
				{JSON.stringify(headers, null, 2)}
			</pre>
		</div>
	);
}

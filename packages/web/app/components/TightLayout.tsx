export function TightLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="container mx-auto px-4 py-12 space-y-6 max-w-2xl">
      {children}
    </main>
  );
}

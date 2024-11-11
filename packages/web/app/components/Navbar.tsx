import { Link } from "@remix-run/react";

interface NavbarProps {
  children?: React.ReactNode;
}

export function Navbar({ children }: NavbarProps) {
  return (
    <header className="font-serif border-b-2 border-black bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-2xl">
        <Link to="/" className="text-xl font-bold">
          WorkerSpy
        </Link>
        <div>{children}</div>
      </div>
    </header>
  );
}

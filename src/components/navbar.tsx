import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-xl font-bold  hover:text-blue-600"
        >
          FoundIt+
        </Link>

        <div className="flex items-center gap-5 text-sm">
          <Link href="/found" className="hover:text-blue-500">
            Found Items
          </Link>

          <Link href="/dashboard" className="hover:text-blue-500">
            Dashboard
          </Link>

          <Link href="/dashboard/found/new" className="hover:text-blue-500">
            Report Found Item
          </Link>
          <div className="flex items-center gap-1 ">
          <Link href="/login" className="hover:text-blue-500">
            Login
          </Link>
          <h2>/</h2>
          <Link href="/register" className="hover:text-blue-500" >
            Register
          </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
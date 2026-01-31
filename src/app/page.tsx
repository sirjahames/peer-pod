import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-4">PeerPod</h1>
        <p className="text-xl text-gray-600 mb-8">
          Form freelance teams based on compatibility
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 border border-black rounded-lg hover:bg-gray-100 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}

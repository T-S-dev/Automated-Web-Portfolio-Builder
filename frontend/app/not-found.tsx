import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background p-6">
      <div className="max-w-md text-center">
        <h2 className="text-4xl font-bold text-white">404 - Page Not Found</h2>
        <p className="mt-4 text-lg text-gray-400">Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link href="/">
          <button className="mt-6 rounded-lg bg-blue-500 px-6 py-3 text-lg font-semibold text-white shadow-md transition hover:bg-blue-600">
            Return to Homepage
          </button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

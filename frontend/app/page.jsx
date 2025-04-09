import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <section className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="mb-4 text-4xl font-bold">Create Your Professional Portfolio in Seconds</h1>
        <p className="mb-6 text-lg text-gray-300">
          Upload your resume, choose a template, and get a professional web portfolio instantly.
        </p>

        <div className="flex space-x-4">
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/sign-up">
              <Button className="bg-blue-500 text-white hover:bg-blue-600">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">View Dashboard</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="flex flex-col items-center px-6 py-12">
        <h2 className="mb-4 text-3xl font-bold">See It In Action</h2>
        <p className="mb-6 text-gray-300">Watch how easy it is to create a portfolio.</p>

        <div className="w-full max-w-3xl">
          <video autoPlay muted loop playsInline aria-label="See It In Action Video">
            <source src="/SeeItInAction.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </section>

      <section className="px-6 py-12">
        <h2 className="mb-8 text-center text-3xl font-bold">How It Works</h2>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-lg bg-gray-900 p-6">
            <h3 className="mb-2 text-xl font-bold">1. Upload Your Resume</h3>
            <p className="text-gray-300">Simply upload a PDF resume.</p>
          </div>
          <div className="rounded-lg bg-gray-900 p-6">
            <h3 className="mb-2 text-xl font-bold">2. Choose a Template</h3>
            <p className="text-gray-300">Select from professionally designed templates.</p>
          </div>
          <div className="rounded-lg bg-gray-900 p-6">
            <h3 className="mb-2 text-xl font-bold">3. Publish & Share</h3>
            <p className="text-gray-300">Get a live portfolio link to share with others.</p>
          </div>
        </div>
      </section>

      <footer className="py-6 text-center text-gray-400">
        {new Date().getFullYear()} Automated Web Portfolio Builder.
      </footer>
    </div>
  );
}

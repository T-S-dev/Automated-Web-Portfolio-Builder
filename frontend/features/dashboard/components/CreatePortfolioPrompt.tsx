import { Button } from "@/shared/components/ui/button";
import Link from "next/link";

const CreatePortfolioSection = () => (
  <div className="flex flex-col items-center justify-center rounded-lg border p-6 shadow-md">
    <p className="mb-4 text-gray-600">You haven&apos;t created a portfolio yet.</p>
    <Button asChild size="lg">
      <Link href="/dashboard/create">Create Portfolio</Link>
    </Button>
  </div>
);

export default CreatePortfolioSection;

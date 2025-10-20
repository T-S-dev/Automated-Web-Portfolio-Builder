"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { Eye, Pencil, Trash2, Copy, Lock, Unlock, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import ConfirmModal from "@/components/ConfirmModal";

import { DashboardPortfolio } from "@/types";

const DashboardClient = ({ portfolio }: { portfolio: DashboardPortfolio }) => {
  const router = useRouter();
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isPrivate, setIsPrivate] = useState(portfolio.is_private);
  const [togglingPrivacy, setTogglingPrivacy] = useState(false);

  const { user } = useUser();

  const username = user?.username || portfolio.username;

  const deletePortfolio = async () => {
    const toastId = toast.loading("Deleting portfolio...");
    try {
      await axios.delete("/api/portfolio");
      toast.success("Portfolio deleted successfully.", { id: toastId });
      router.refresh();
    } catch (error) {
      toast.error("Error deleting portfolio, please try again.", {
        id: toastId,
      });
    }
  };

  const togglePrivacy = async () => {
    if (togglingPrivacy) return;

    setTogglingPrivacy(true);
    try {
      await axios.put("/api/portfolio", {
        is_private: !isPrivate,
      });
      setIsPrivate(!isPrivate);
      toast.success(`Portfolio is now ${isPrivate ? "public" : "private"}`);
    } catch (error) {
      toast.error("Error updating portfolio privacy, please try again.");
    } finally {
      setTogglingPrivacy(false);
    }
  };

  const copyToClipboard = async () => {
    const portfolioUrl = `${window.location.origin}/portfolio/${username}`;
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      toast.success("Portfolio link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link to clipboard");
    }
  };

  return (
    <div className="rounded-lg border p-4 shadow-md sm:p-6">
      <h2 className="text-xl font-bold sm:text-2xl">{portfolio.personal.name}&apos;s Portfolio</h2>

      <div className="mt-4 flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-4">
          <Button asChild className="min-w-[150px] flex-1 hover:scale-[102%] sm:flex-[1_0_auto]">
            <Link href={`/portfolio/${username}`} target="_blank" className="flex items-center justify-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="whitespace-nowrap">View Portfolio</span>
            </Link>
          </Button>

          <Button asChild variant="secondary" className="min-w-[150px] flex-1 hover:scale-[102%] sm:flex-[1_0_auto]">
            <Link href="/dashboard/edit" className="flex items-center justify-center gap-2">
              <Pencil className="h-4 w-4" />
              <span className="whitespace-nowrap">Edit Portfolio</span>
            </Link>
          </Button>

          <Button
            onClick={() => setIsConfirmDeleteOpen(true)}
            variant="destructive"
            className="min-w-[150px] flex-1 items-center justify-center gap-2 hover:scale-[102%] sm:flex-[1_0_auto]"
          >
            <Trash2 className="h-4 w-4" />
            <span className="whitespace-nowrap">Delete Portfolio</span>
          </Button>
        </div>

        <div className="flex w-full items-center justify-end gap-2 sm:w-auto sm:gap-4">
          <Button
            variant="outline"
            onClick={togglePrivacy}
            className="flex flex-1 items-center gap-2 sm:flex-none"
            disabled={togglingPrivacy}
          >
            {togglingPrivacy ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : isPrivate ? (
              <Lock className="h-4 w-4" />
            ) : (
              <Unlock className="h-4 w-4" />
            )}

            {isPrivate ? (
              <span className="whitespace-nowrap">Make Public</span>
            ) : (
              <span className="whitespace-nowrap">Make Private</span>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={copyToClipboard}
            aria-label="Copy portfolio link"
            className="flex aspect-square items-center gap-2 sm:aspect-auto"
          >
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">Copy Link</span>
          </Button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={deletePortfolio}
        title="Delete Portfolio"
        description="Are you sure you want to delete your portfolio? This action cannot be undone."
        confirmText="Yes, Delete Portfolio"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
    </div>
  );
};

export default DashboardClient;

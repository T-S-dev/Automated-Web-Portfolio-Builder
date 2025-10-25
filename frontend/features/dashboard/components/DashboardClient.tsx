"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Eye, Pencil, Trash2, Lock, Unlock, LoaderCircle, ExternalLink, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import ConfirmModal from "@/shared/components/ConfirmModal";

import { deletePortfolioAction, togglePrivacyAction } from "@/features/portfolio/actions";

import type { DashboardPortfolio } from "@/types";

const DashboardClient = ({ portfolio }: { portfolio: DashboardPortfolio }) => {
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isToggling, startToggleTransition] = useTransition();

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isPrivate, setIsPrivate] = useState(portfolio.is_private);
  const { user } = useUser();
  const username = user?.username || portfolio.username;

  const handleDelete = () => {
    setIsConfirmDeleteOpen(false);
    startDeleteTransition(async () => {
      const result = await deletePortfolioAction();
      if (!result.success) {
        toast.error(result.error);
      }
    });
  };

  const handleTogglePrivacy = () => {
    startToggleTransition(async () => {
      const result = await togglePrivacyAction(!isPrivate);
      if (result.success) {
        setIsPrivate(result.data.is_private);
      } else {
        toast.error(result.error);
      }
    });
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
    <div className="group border-border/50 bg-card hover:border-border relative overflow-hidden rounded-xl border shadow-lg transition-all duration-300 hover:shadow-xl">
      {/* Subtle gradient overlay */}
      <div className="from-primary/5 to-accent/5 absolute inset-0 bg-gradient-to-br via-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative p-6 sm:p-8">
        {/* Header Section */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-foreground text-2xl font-bold tracking-tight text-balance sm:text-3xl">
              {portfolio.personal.name}&apos;s Portfolio
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">Manage your portfolio settings and visibility</p>
          </div>

          {/* Privacy Badge */}
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              isPrivate ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
            }`}
          >
            {isPrivate ? (
              <>
                <Lock className="size-4" />
                <span>Private</span>
              </>
            ) : (
              <>
                <Unlock className="size-4" />
                <span>Public</span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* View Portfolio Button */}
          <Button asChild className="group/btn h-auto flex-col items-start gap-2 p-4 transition-all hover:scale-[1.02]">
            <Link href={`/portfolio/${username}`} target="_blank">
              <div className="flex w-full items-center justify-between">
                <Eye />
                <ExternalLink className="opacity-50" />
              </div>
              <div className="w-full text-left">
                <div className="font-semibold">View Portfolio</div>
                <div className="text-xs opacity-80">Open in new tab</div>
              </div>
            </Link>
          </Button>

          {/* Edit Portfolio Button */}
          <Button
            asChild
            variant="secondary"
            className="group/btn h-auto flex-col items-start gap-2 p-4 transition-all hover:scale-[1.02]"
          >
            <Link href="/dashboard/edit">
              <div className="flex w-full items-center justify-between">
                <Pencil />
              </div>
              <div className="w-full text-left">
                <div className="font-semibold">Edit Portfolio</div>
                <div className="text-xs opacity-80">Update content</div>
              </div>
            </Link>
          </Button>

          {/* Toggle Privacy Button */}
          <Button
            onClick={handleTogglePrivacy}
            variant="outline"
            disabled={isToggling}
            className="group/btn h-auto flex-col items-start gap-2 bg-transparent p-4 transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex w-full items-center justify-between">
              {isToggling ? <LoaderCircle className="animate-spin" /> : isPrivate ? <Unlock /> : <Lock />}
            </div>
            <div className="w-full text-left">
              <div className="font-semibold">{isPrivate ? "Make Public" : "Make Private"}</div>
              <div className="text-xs opacity-80">{isPrivate ? "Share with world" : "Hide from public"}</div>
            </div>
          </Button>

          {/* Copy Link Button */}
          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="group/btn h-auto flex-col items-start gap-2 bg-transparent p-4 transition-all hover:scale-[1.02]"
          >
            <div className="flex w-full items-center justify-between">
              <Share2 />
            </div>
            <div className="w-full text-left">
              <div className="font-semibold">Copy Link</div>
              <div className="text-xs opacity-80">Share portfolio</div>
            </div>
          </Button>
        </div>

        {/* Delete Section  */}
        <div className="border-border/50 mt-6 border-t pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-foreground text-sm font-semibold">Danger Zone</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Permanently delete your portfolio and all its content
              </p>
            </div>
            <Button
              onClick={() => setIsConfirmDeleteOpen(true)}
              variant="destructive"
              size="sm"
              className="group/delete w-full transition-all hover:scale-[1.02] sm:w-auto"
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 transition-transform group-hover/delete:scale-110" />
              Delete Portfolio
            </Button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
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

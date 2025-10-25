"use client";

import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";

type AIEnhanceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  original: string;
  suggestion: string;
  onAccept: () => void;
};

const AIEnhanceModal = ({ open, onOpenChange, title, original, suggestion, onAccept }: AIEnhanceModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg lg:max-w-3xl xl:max-w-5xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">
            Compares original text with an AI suggestion. Choose to keep original or use suggested text.
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[60vh] gap-6 lg:grid-cols-2">
          {/* Original Text Column */}
          <div className="flex flex-col gap-2">
            <h3 className="text-muted-foreground font-semibold">Original</h3>
            <section className="flex-1 overflow-y-auto rounded-md border bg-gray-800 p-4">
              <div dangerouslySetInnerHTML={{ __html: original }} />
            </section>
          </div>

          {/* Suggested Text Column */}
          <div className="flex flex-col gap-2">
            <h3 className="text-muted-foreground font-semibold">Suggested by AI</h3>
            <section className="flex-1 overflow-y-auto rounded-md border bg-gray-800 p-4">
              <div dangerouslySetInnerHTML={{ __html: suggestion }} />
            </section>
          </div>
        </div>

        <footer className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep Original
          </Button>
          <Button onClick={onAccept} className="bg-blue-500 text-white hover:bg-blue-600">
            Use Suggested
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
};

export default AIEnhanceModal;

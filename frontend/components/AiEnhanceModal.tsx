"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
      <DialogContent className="max-w-3xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="grid max-h-[48vh] gap-6 overflow-auto md:grid-cols-2">
          <section className="overflow-y-auto rounded-md border bg-gray-800 p-4">
            <h3 className="mb-2 text-lg font-semibold">Original</h3>
            <div dangerouslySetInnerHTML={{ __html: original }} />
          </section>

          <section className="overflow-y-auto rounded-md border bg-gray-800 p-4">
            <h3 className="mb-2 text-lg font-semibold">Suggested</h3>
            <div dangerouslySetInnerHTML={{ __html: suggestion }} />
          </section>
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

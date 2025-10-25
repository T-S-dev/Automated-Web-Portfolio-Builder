"use client";
import DZ, { DropzoneOptions } from "react-dropzone";
import { toast } from "sonner";

import Loader from "@/shared/components/Loader";

import { cn } from "@/shared/lib/utils";

type DropzoneProps = {
  className?: string;
  onFileUpload: (file: File) => void;
  processing: boolean;
};

const Dropzone = ({ className, onFileUpload, processing }: DropzoneProps) => {
  const MAX_FILE_SIZE = 20971520;

  const onDrop: DropzoneOptions["onDrop"] = (acceptedFiles) => {
    if (acceptedFiles.length === 0 || processing) return;

    const acceptedFile = acceptedFiles[0];

    if (acceptedFile.size > MAX_FILE_SIZE) {
      toast.error(`File ${acceptedFile.name} is too large!`);
      return;
    }

    onFileUpload(acceptedFile);
  };

  return (
    <DZ onDrop={onDrop} maxFiles={1}>
      {({ getRootProps, getInputProps, isDragActive, isDragReject }) => (
        <section className={cn(className)}>
          <div
            {...getRootProps()}
            className={cn(
              "flex h-60 w-full cursor-pointer items-center justify-center rounded-md border border-dashed border-gray-300",
              isDragActive && "bg-background-hover animate-pulse",
              processing ? "cursor-not-allowed opacity-50" : "hover:bg-background-hover",
            )}
          >
            <input {...getInputProps()} disabled={processing} aria-label="File upload" />
            {processing ? (
              <Loader />
            ) : !isDragActive ? (
              "Click here or drop your resume to upload!"
            ) : isDragActive && !isDragReject ? (
              "Drop a file to upload"
            ) : (
              "File not accepted, sorry!"
            )}
          </div>
        </section>
      )}
    </DZ>
  );
};

export default Dropzone;

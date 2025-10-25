"use client";

import { useEffect, useState } from "react";
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react";
import sanitizeHtml from "sanitize-html";
import { useEditor, EditorContent } from "@tiptap/react";
import Bold from "@tiptap/extension-bold";
import Document from "@tiptap/extension-document";
import Italic from "@tiptap/extension-italic";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { TextStyle, Color } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";

import { Button } from "@/shared/components/ui/button";

import { sanitizeOptions } from "@/shared/lib/utils";

import { type UseFormSetValue, type FieldValues, type Path, type PathValue } from "react-hook-form";

const DEFAULT_COLOR = "#f8fafc";

type RTEditorProps<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>;
  setValue: UseFormSetValue<TFieldValues>;
  content: string | null | undefined;
  extraToolbarButtons?: React.ReactNode[];
};

const RTEditor = <TFieldValues extends FieldValues>({
  name,
  setValue,
  content,
  extraToolbarButtons = [],
}: RTEditorProps<TFieldValues>) => {
  const [color, setColor] = useState(DEFAULT_COLOR);

  const editor = useEditor({
    extensions: [
      Document,
      Text,
      Paragraph,
      Bold,
      Italic,
      Underline,
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-24",
      },
    },
    immediatelyRender: false,
    onUpdate({ editor }) {
      const dirtyHtml = editor.getHTML();
      const cleanHtml = sanitizeHtml(dirtyHtml, sanitizeOptions);
      // If the editor is empty (only contains a paragraph tag with no content), set the value to an empty string
      if (cleanHtml === "<p></p>") {
        setValue(name, "" as PathValue<TFieldValues, Path<TFieldValues>>, { shouldValidate: true, shouldDirty: true });
        return;
      }
      setValue(name, cleanHtml as PathValue<TFieldValues, Path<TFieldValues>>);
    },
  });

  useEffect(() => {
    const isSame =
      sanitizeHtml(editor?.getHTML() || "", sanitizeOptions) === sanitizeHtml(content || "", sanitizeOptions);

    if (editor && !isSame) {
      editor.commands.setContent(content || "", { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-col rounded-md border p-2">
      <div className="mb-2 flex flex-wrap gap-2">
        <Button
          variant="ghost"
          aria-label="Toggle Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded-md border-2 p-2 ${editor.isActive("bold") ? "border-gray-600" : "border-transparent"}`}
        >
          <BoldIcon />
        </Button>

        <Button
          variant="ghost"
          aria-label="Toggle Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded-md border-2 p-2 ${editor.isActive("italic") ? "border-gray-600" : "border-transparent"}`}
        >
          <ItalicIcon />
        </Button>

        <Button
          variant="ghost"
          aria-label="Toggle Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`rounded-md border-2 p-2 ${editor.isActive("underline") ? "border-gray-600" : "border-transparent"}`}
        >
          <UnderlineIcon />
        </Button>

        <div className="relative">
          <Button className="flex items-center space-x-2 rounded-md border-2 border-transparent p-2" variant="ghost">
            <div className="h-6 w-6 rounded-full border" style={{ backgroundColor: color }}></div>
          </Button>
          <input
            aria-label="Color Picker"
            type="color"
            id="colorPicker"
            value={color}
            onChange={(e) => {
              const selectedColor = e.target.value;
              setColor(selectedColor);
              editor?.chain().focus().setColor(selectedColor).run();
            }}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            setColor(DEFAULT_COLOR);
            editor.chain().focus().unsetColor().run();
          }}
        >
          Reset Color
        </Button>

        {extraToolbarButtons.map((Btn, i) => (
          <div key={i}>{Btn}</div>
        ))}
      </div>
      <EditorContent editor={editor} className="rounded-lg border p-2" />
    </div>
  );
};

export default RTEditor;

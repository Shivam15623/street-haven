import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";

// TypeScript fix for color extension
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    color: {
      setColor: (color: string) => ReturnType;
      unsetColor: () => ReturnType;
    };
  }
}

interface TiptapEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  content = "",
  onChange,
  placeholder = "Write your description...",
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      Color.configure({ types: ["textStyle"] }),
      TextStyle,
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) return null;

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    editor.chain().focus().insertContent(emojiData.emoji).run();
    setShowEmojiPicker(false);
  };

  return (
    <div className="border rounded p-3 bg-white shadow-sm position-relative">
      {/* Toolbar */}
      <div className="d-flex flex-wrap gap-2 border-bottom pb-2 mb-3">
        {/* Bold */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
          }}
          className={`btn btn-sm ${
            editor.isActive("bold") ? "btn-secondary" : "btn-outline-secondary"
          }`}
        >
          <b>B</b>
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
          }}
          className={`btn btn-sm ${
            editor.isActive("italic")
              ? "btn-secondary"
              : "btn-outline-secondary"
          }`}
        >
          <i>I</i>
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleUnderline().run();
          }}
          className={`btn btn-sm ${
            editor.isActive("underline")
              ? "btn-secondary"
              : "btn-outline-secondary"
          }`}
        >
          <u>U</u>
        </button>

        {/* Bullet List */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBulletList().run();
          }}
          className={`btn btn-sm ${
            editor.isActive("bulletList")
              ? "btn-secondary"
              : "btn-outline-secondary"
          }`}
        >
          • List
        </button>

        {/* Numbered List */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleOrderedList().run();
          }}
          className={`btn btn-sm ${
            editor.isActive("orderedList")
              ? "btn-secondary"
              : "btn-outline-secondary"
          }`}
        >
          1.
        </button>

        {/* Link */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            const url = prompt("Enter URL");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`btn btn-sm ${
            editor.isActive("link") ? "btn-secondary" : "btn-outline-secondary"
          }`}
        >
          🔗
        </button>

        {/* Text Color */}
        <input
          type="color"
          className="form-control form-control-color"
          onChange={(e) =>
            editor.chain().focus().setColor(e.target.value).run()
          }
          title="Text color"
        />

        {/* Emoji Picker Button */}
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        >
          😀
        </button>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div
          className="position-absolute bg-white p-2 border rounded shadow-sm"
          style={{ zIndex: 100, top: "70px" }}
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={300}
            height={400}
          />
        </div>
      )}

      {/* Editable Area */}
      <div
        className="tiptap-editor-content border-1 p-0"
        style={{
          minHeight: "100px",
          maxHeight: "500px",
          overflowY: "auto",
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TiptapEditor;

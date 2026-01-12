import React, { useState, useRef, useEffect, useId } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { Form } from "react-bootstrap";
import { createPortal } from "react-dom";

interface QuillEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  features?: {
    emoji?: boolean;
    color?: boolean;
    align?: boolean;
    link?: boolean;
    backgroundColor?: boolean;
    headings?: boolean;
    lists?: boolean;
  };
}

const QuillEditor: React.FC<QuillEditorProps> = ({
  content = "",
  onChange,
  placeholder = "Write something...",
  className = "",
  disabled = false,
  isInvalid = false,
  errorMessage,
  features = {
    emoji: true,
    color: true,
    align: true,
    link: true,
    backgroundColor: true,
    headings: true,
    lists: true,
  },
}) => {
  const [value, setValue] = useState(content);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
 
  const quillRef = useRef<ReactQuill>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const [editorHeight, setEditorHeight] = useState(100);
  const [emojiPosition, setEmojiPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const uniqueId = useId();
  const toolbarId = `toolbar-${uniqueId.replace(/:/g, "-")}`;

  // Sync external content changes
  useEffect(() => {
    setValue(content);
  }, [content]);

  // Auto-resize height based on content
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    const adjustHeight = () => {
      const scrollHeight = editor.root.scrollHeight;
      const newHeight = Math.min(scrollHeight, 400);
      setEditorHeight(newHeight);
    };

    adjustHeight();
    editor.on("text-change", adjustHeight);

    return () => {
      editor.off("text-change", adjustHeight);
    };
  }, []);

  const handleChange = (content: string) => {
    setValue(content);
    onChange?.(content);
  };
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".EmojiPickerReact")) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showEmojiPicker]);
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    editor.focus();
    const range = editor.getSelection(true);
    if (range) {
      editor.insertText(range.index, emoji);
      editor.setSelection(range.index + emoji.length, 0);
    } else {
      editor.insertText(editor.getLength(), emoji);
    }
  };

  const handleEmojiToggle = () => {
    if (!emojiButtonRef.current) return;

    const rect = emojiButtonRef.current.getBoundingClientRect();
    const pickerHeight = 320;

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < pickerHeight;

 

    setEmojiPosition({
      top: openUp ? rect.top - pickerHeight - 8 : rect.bottom + 8,
      left: rect.right - 260, // align right
    });

    setShowEmojiPicker((prev) => !prev);
  };

  const modules = {
    toolbar: disabled ? false : { container: `#${toolbarId}` },
  };

  return (
    <div className={`w-100 ${className}`}>
      <div
        className={`border-1 rounded bg-white  position-relative ${
          isInvalid ? "border-danger" : "border-sh-base-50"
        }`}
        style={{
          display: "flex",
          flexDirection: "column",
          opacity: disabled ? 0.8 : 1,
        }}
      >
        {!disabled && (
          <div
            id={toolbarId}
            className="d-flex  align-items-center gap-2 border-bottom me-0 pe-0 bg-light p-2  flex-wrap"
            style={{
              top: 0,
              zIndex: 1,
              marginRight: "0px",
              paddingRight: "0px",
            }}
          >
            {features.headings && (
              <select className="ql-header text-street-base" defaultValue="">
                <option value="1">Heading 1</option>
                <option value="2">Heading 2</option>
                <option value="3">Heading 3</option>
                <option value="">Normal</option>
              </select>
            )}

            <button className="ql-bold" />
            <button className="ql-italic" />
            <button className="ql-underline" />
            <button className="ql-strike" />

            {features.color && (
              <select className="ql-color" defaultValue="">
                <option value=""></option>
                <option value="red"></option>
                <option value="green"></option>
                <option value="blue"></option>
                <option value="orange"></option>
                <option value="purple"></option>
                <option value="black"></option>
              </select>
            )}

            {features.backgroundColor && (
              <select className="ql-background" defaultValue="">
                <option value=""></option>
                <option value="yellow"></option>
                <option value="cyan"></option>
                <option value="lime"></option>
                <option value="pink"></option>
                <option value="lightgray"></option>
              </select>
            )}

            {features.lists && (
              <>
                <button className="ql-list" value="ordered" />
                <button className="ql-list" value="bullet" />
              </>
            )}

            {features.align && (
              <>
                <button className="ql-align" value="" />
                <button className="ql-align" value="center" />
                <button className="ql-align" value="right" />
              </>
            )}

            {features.link && <button className="ql-link" />}

            {features.emoji && (
              <button
                ref={emojiButtonRef}
                type="button"
                onClick={handleEmojiToggle}
                className="btn btn-sm btn-light ms-2"
              >
                😊
              </button>
            )}
          </div>
        )}

        {showEmojiPicker &&
          features.emoji &&
          !disabled &&
          emojiPosition &&
          createPortal(
            <div
              className="bg-white border rounded shadow p-2"
              style={{
                position: "fixed",
                top: emojiPosition.top,
                left: emojiPosition.left,
                zIndex: 9999, // 🔥 always on top
              }}
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                height={320}
                width={260}
              />
            </div>,
            document.body
          )}

        <div
          style={{
            flex: 1,
            overflowY: "hidden",
            overflowX:"visible",
            cursor: disabled ? "not-allowed" : "text",
            borderBottomRightRadius: "inherit",
            borderBottomLeftRadius: "inherit",
          }}
        >
          <ReactQuill
            ref={quillRef}
            value={value}
            onChange={handleChange}
            modules={modules}
            readOnly={disabled}
            theme="snow"
            placeholder={placeholder}
            style={{
              height: `${editorHeight}px`,
              minHeight: "80px",
              maxHeight: "130px",
            }}
          />
        </div>
      </div>

      {isInvalid && errorMessage && (
        <Form.Control.Feedback type="invalid" className="d-block mt-1">
          {errorMessage}
        </Form.Control.Feedback>
      )}
    </div>
  );
};

export default QuillEditor;

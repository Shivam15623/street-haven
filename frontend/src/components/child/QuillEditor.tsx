import React, { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { Form } from "react-bootstrap";

interface QuillEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
}

const QuillEditor: React.FC<QuillEditorProps> = ({
  content = "",
  onChange,
  placeholder = "Write something...",
  className = "",
  disabled = false,
  isInvalid = false,
  errorMessage,
}) => {
  const [value, setValue] = useState(content);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    setValue(content);
  }, [content]);

  const handleChange = (content: string) => {
    setValue(content);
    onChange?.(content);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    editor.focus();
    const range = editor.getSelection(true);
    if (range) {
      editor.insertText(range.index, emoji);
      editor.setSelection(range.index + emoji.length, 0); // ✅ fixed
    } else {
      editor.insertText(editor.getLength(), emoji);
    }
  };

  const modules = {
    toolbar: disabled
      ? false
      : {
          container: "#toolbar",
        },
  };

  return (
    <div className={`w-100 ${className}`}>
      <div
        className={`border rounded bg-white shadow-sm position-relative overflow-hidden ${
          isInvalid ? "border-danger" : "border-secondary"
        }`}
        style={{
          height: "300px",
          display: "flex",
          flexDirection: "column",
          opacity: disabled ? 0.8 : 1,
          pointerEvents: disabled ? "none" : "auto",
        }}
      >
        {!disabled && (
          <div
            id="toolbar"
            className="d-flex align-items-center gap-2 border-bottom bg-light p-2 sticky-top flex-wrap"
            style={{ top: 0, zIndex: 10 }}
          >
            <select className="ql-header text-street-base" defaultValue="">
              <option value="1">H1</option>
              <option value="2">H2</option>
              <option value="3">H3</option>
              <option value="4">H4</option>
              <option value="5">H5</option>
              <option value="6">H6</option>
              <option value="">Normal</option>
            </select>

            <button className="ql-bold" />
            <button className="ql-italic" />
            <button className="ql-underline" />
            <button className="ql-strike" />

            <select className="ql-color" defaultValue="">
              <option value=""></option>
              <option value="red"></option>
              <option value="green"></option>
              <option value="blue"></option>
              <option value="orange"></option>
              <option value="purple"></option>
              <option value="black"></option>
            </select>

            <select className="ql-background" defaultValue="">
              <option value=""></option>
              <option value="yellow"></option>
              <option value="cyan"></option>
              <option value="lime"></option>
              <option value="pink"></option>
              <option value="lightgray"></option>
            </select>

            <button className="ql-list" value="ordered" />
            <button className="ql-list" value="bullet" />
            <button className="ql-align" value="" />
            <button className="ql-align" value="center" />
            <button className="ql-align" value="right" />
            <button className="ql-link" />

            {/* Emoji button */}
            <div className="position-relative">
              {" "}
              <button
                type="button"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className="btn btn-sm btn-light ms-2"
              >
                😊
              </button>
              {showEmojiPicker && !disabled && (
                <div
                  className="position-absolute bg-white border rounded shadow p-2"
                  style={{ top: "50px", right: "10px", zIndex: 20 }}
                >
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    height={320}
                    width={260}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto" }}>
          <ReactQuill
            ref={quillRef}
            value={value}
            onChange={handleChange}
            modules={modules}
            readOnly={disabled}
            theme="snow"
            placeholder={placeholder}
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

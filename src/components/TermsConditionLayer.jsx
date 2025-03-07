"use client";
import { useEffect, useRef, forwardRef, useState } from "react";
import hljs from "highlight.js";
import dynamic from "next/dynamic";
import "highlight.js/styles/github.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const TermsConditionLayer = forwardRef(({ value, onChange, name, id }, ref) => {
  const quillRef = useRef(null);
  const [isHighlightReady, setIsHighlightReady] = useState(false);

  useEffect(() => {
    // Load highlight.js configuration and signal when ready
    hljs?.configure({
      languages: [
        "javascript",
        "ruby",
        "python",
        "java",
        "csharp",
        "cpp",
        "go",
        "php",
        "swift",
      ],
    });
  }, []);

  // Quill editor modules with syntax highlighting (only load if highlight.js is ready)
  const modules = isHighlightReady
      ? {
        syntax: {
          highlight: (text) => hljs?.highlightAuto(text).value, // Enable highlight.js in Quill
        },
        toolbar: {
          container: `#${id}`, // Use the unique ID for the toolbar container
        },
      }
      : {
        toolbar: {
          container: `#${id}`, // Use the unique ID for the toolbar container
        },
      };

  const formats = [
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "script",
    "header",
    "blockquote",
    "code-block",
    "list",
    "indent",
    "direction",
    "align",
    "link",
    "image",
    "video",
    "formula",
  ];

  return (
      <>
        <div className="card basic-data-table radius-12 overflow-hidden">
          <div className="card-body p-0">
            {/* Editor Toolbar */}
            <div id={id}> {/* Use the unique ID */}
              <span className="ql-formats">
                            <select className="ql-font"></select>
                            <select className="ql-size"></select>
                        </span>
              <span className="ql-formats">
                            <button className="ql-bold"></button>
                            <button className="ql-italic"></button>
                            <button className="ql-underline"></button>
                            <button className="ql-strike"></button>
                        </span>
              <span className="ql-formats">
                            <select className="ql-color"></select>
                            <select className="ql-background"></select>
                        </span>
              <span className="ql-formats">
                            <button className="ql-script" value="sub"></button>
                            <button className="ql-script" value="super"></button>
                        </span>
              <span className="ql-formats">
                            <button className="ql-header" value="1"></button>
                            <button className="ql-header" value="2"></button>
                            <button className="ql-blockquote"></button>
                            <button className="ql-code-block"></button>
                        </span>
              <span className="ql-formats">
                            <button className="ql-list" value="ordered"></button>
                            <button className="ql-list" value="bullet"></button>
                            <button className="ql-indent" value="-1"></button>
                            <button className="ql-indent" value="+1"></button>
                        </span>
              <span className="ql-formats">
                            <button className="ql-direction" value="rtl"></button>
                            <select className="ql-align"></select>
                        </span>
              <span className="ql-formats">
                            <button className="ql-link"></button>
                            <button className="ql-image"></button>
                            <button className="ql-video"></button>
                            <button className="ql-formula"></button>
                        </span>
              <span className="ql-formats">
                            <button className="ql-clean"></button>
                        </span>
            </div>

            {/* Quill Editor */}
            <ReactQuill
                ref={(el) => {
                  quillRef.current = el; // Set the local ref
                  if (ref) {
                    ref.current = el; // Forward the ref to the parent
                  }
                }}
                theme="snow"
                value={value}
                onChange={(content) => onChange(content, name)} // Notify parent of changes
                modules={modules}
                formats={formats}
                placeholder="Compose an epic..."
            />
          </div>
        </div>
      </>
  );
});

TermsConditionLayer.displayName = "TermsConditionLayer"; // Add display name for debugging

export default TermsConditionLayer;
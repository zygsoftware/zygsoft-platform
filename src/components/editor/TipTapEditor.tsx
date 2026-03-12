"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect } from "react";

type TipTapEditorProps = {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
    className?: string;
    editable?: boolean;
};

export function TipTapEditor({
    content,
    onChange,
    placeholder = "İçerik yazın...",
    className = "",
    editable = true,
}: TipTapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Image.configure({ inline: false, allowBase64: true }),
            Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-[#e6c800] underline" } }),
            Placeholder.configure({ placeholder }),
        ],
        content,
        editable,
        editorProps: {
            attributes: {
                class: "prose prose-slate max-w-none min-h-[200px] px-4 py-3 focus:outline-none",
            },
            handleDOMEvents: {
                paste: (view, event) => {
                    const items = event.clipboardData?.items;
                    if (!items) return;
                    for (const item of Array.from(items)) {
                        if (item.type.startsWith("image/")) {
                            event.preventDefault();
                            const file = item.getAsFile();
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                    const src = reader.result as string;
                                    view.dispatch(view.state.tr.replaceSelectionWith(
                                        view.state.schema.nodes.image.create({ src })
                                    ));
                                };
                                reader.readAsDataURL(file);
                            }
                            return;
                        }
                    }
                },
            },
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content, { emitUpdate: false });
        }
    }, [content, editor]);

    const handleUpdate = useCallback(() => {
        if (editor) {
            onChange(editor.getHTML());
        }
    }, [editor, onChange]);

    useEffect(() => {
        if (editor) {
            editor.on("update", handleUpdate);
            return () => {
                editor.off("update", handleUpdate);
            };
        }
    }, [editor, handleUpdate]);

    if (!editor) return null;

    return (
        <div className={`border border-slate-200 rounded-xl overflow-hidden bg-white ${className}`}>
            {editable && (
                <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 bg-slate-50">
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold ${editor.isActive("bold") ? "bg-slate-200" : "hover:bg-slate-100"}`}
                    >
                        B
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`px-3 py-1.5 rounded-lg text-sm italic ${editor.isActive("italic") ? "bg-slate-200" : "hover:bg-slate-100"}`}
                    >
                        I
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold ${editor.isActive("heading", { level: 1 }) ? "bg-slate-200" : "hover:bg-slate-100"}`}
                    >
                        H1
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold ${editor.isActive("heading", { level: 2 }) ? "bg-slate-200" : "hover:bg-slate-100"}`}
                    >
                        H2
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold ${editor.isActive("heading", { level: 3 }) ? "bg-slate-200" : "hover:bg-slate-100"}`}
                    >
                        H3
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`px-3 py-1.5 rounded-lg text-sm ${editor.isActive("bulletList") ? "bg-slate-200" : "hover:bg-slate-100"}`}
                    >
                        •
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`px-3 py-1.5 rounded-lg text-sm ${editor.isActive("orderedList") ? "bg-slate-200" : "hover:bg-slate-100"}`}
                    >
                        1.
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`px-3 py-1.5 rounded-lg text-sm ${editor.isActive("blockquote") ? "bg-slate-200" : "hover:bg-slate-100"}`}
                    >
                        "
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        className={`px-3 py-1.5 rounded-lg text-sm font-mono ${editor.isActive("codeBlock") ? "bg-slate-200" : "hover:bg-slate-100"}`}
                    >
                        {"</>"}
                    </button>
                </div>
            )}
            <EditorContent editor={editor} />
        </div>
    );
}

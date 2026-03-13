"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef, useState } from "react";

type TipTapEditorProps = {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
    className?: string;
    editable?: boolean;
};

const btnBase = "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border";
const btnInactive = "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300";
const btnActive = "border-slate-700 bg-slate-800 text-white";

export function TipTapEditor({
    content,
    onChange,
    placeholder = "İçerik yazın...",
    className = "",
    editable = true,
}: TipTapEditorProps) {
    const lastEmittedHtml = useRef<string | null>(null);
    const [, forceUpdate] = useState(0);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                bulletList: {},
                orderedList: {},
                listItem: {},
            }),
            Image.configure({ inline: false, allowBase64: true }),
            Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-[#e6c800] underline" } }),
            Placeholder.configure({ placeholder }),
        ],
        content: content || "",
        editable,
        onUpdate: ({ editor: ed }) => {
            const html = ed.getHTML();
            lastEmittedHtml.current = html;
            onChange(html);
        },
        editorProps: {
            attributes: {
                class: "tiptap-content max-w-none px-4 py-3 focus:outline-none",
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
        if (!editor) return;
        if (content === lastEmittedHtml.current) return;
        if (content === editor.getHTML()) return;
        lastEmittedHtml.current = content;
        editor.commands.setContent(content, { emitUpdate: false });
    }, [content, editor]);

    useEffect(() => {
        if (!editor) return;
        const onUpdate = () => forceUpdate((n) => n + 1);
        editor.on("selectionUpdate", onUpdate);
        editor.on("transaction", onUpdate);
        return () => {
            editor.off("selectionUpdate", onUpdate);
            editor.off("transaction", onUpdate);
        };
    }, [editor]);

    if (!editor) return null;

    const runCmd = (fn: () => boolean) => {
        fn();
    };

    return (
        <div className={`border border-slate-200 rounded-xl overflow-hidden bg-white ${className}`}>
            {editable && (
                <div className="flex flex-wrap gap-1.5 p-2.5 border-b border-slate-200 bg-slate-50/80">
                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            runCmd(() => editor.chain().focus().toggleBold().run());
                        }}
                        title="Kalın"
                        className={`${btnBase} ${editor.isActive("bold") ? btnActive : btnInactive}`}
                    >
                        <span className="font-bold">B</span>
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            runCmd(() => editor.chain().focus().toggleItalic().run());
                        }}
                        title="İtalik"
                        className={`${btnBase} ${editor.isActive("italic") ? btnActive : btnInactive}`}
                    >
                        <span className="italic">I</span>
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            runCmd(() => editor.chain().focus().toggleHeading({ level: 1 }).run());
                        }}
                        title="Başlık 1"
                        className={`${btnBase} ${editor.isActive("heading", { level: 1 }) ? btnActive : btnInactive}`}
                    >
                        H1
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            runCmd(() => editor.chain().focus().toggleHeading({ level: 2 }).run());
                        }}
                        title="Başlık 2"
                        className={`${btnBase} ${editor.isActive("heading", { level: 2 }) ? btnActive : btnInactive}`}
                    >
                        H2
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            runCmd(() => editor.chain().focus().toggleHeading({ level: 3 }).run());
                        }}
                        title="Başlık 3"
                        className={`${btnBase} ${editor.isActive("heading", { level: 3 }) ? btnActive : btnInactive}`}
                    >
                        H3
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            runCmd(() => editor.chain().focus().toggleBulletList().run());
                        }}
                        title="Madde işaretli liste"
                        className={`${btnBase} ${editor.isActive("bulletList") ? btnActive : btnInactive}`}
                    >
                        •
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            runCmd(() => editor.chain().focus().toggleOrderedList().run());
                        }}
                        title="Numaralı liste"
                        className={`${btnBase} ${editor.isActive("orderedList") ? btnActive : btnInactive}`}
                    >
                        1.
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            runCmd(() => editor.chain().focus().toggleBlockquote().run());
                        }}
                        title="Alıntı"
                        className={`${btnBase} ${editor.isActive("blockquote") ? btnActive : btnInactive}`}
                    >
                        "
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            runCmd(() => editor.chain().focus().toggleCodeBlock().run());
                        }}
                        title="Kod bloğu"
                        className={`${btnBase} ${editor.isActive("codeBlock") ? btnActive : btnInactive}`}
                    >
                        <span className="font-mono text-xs">{"</>"}</span>
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            runCmd(() => editor.chain().focus().setHorizontalRule().run());
                        }}
                        title="Yatay çizgi"
                        className={`${btnBase} ${btnInactive}`}
                    >
                        —
                    </button>
                </div>
            )}
            <EditorContent editor={editor} />
        </div>
    );
}

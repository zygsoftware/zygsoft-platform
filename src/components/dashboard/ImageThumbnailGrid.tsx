"use client";

import { useState, useEffect } from "react";
import JSZip from "jszip";

interface ImageThumbnailGridProps {
    zipBlob: Blob;
    className?: string;
}

export function ImageThumbnailGrid({ zipBlob, className = "" }: ImageThumbnailGridProps) {
    const [thumbnails, setThumbnails] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let revoked: string[] = [];
        const load = async () => {
            try {
                const zip = await JSZip.loadAsync(zipBlob);
                const imageFiles = Object.keys(zip.files).filter(
                    (name) =>
                        !zip.files[name].dir &&
                        /\.(png|jpg|jpeg)$/i.test(name)
                );
                const urls: string[] = [];
                for (const name of imageFiles.slice(0, 12)) {
                    const file = zip.files[name];
                    const blob = await file.async("blob");
                    const url = URL.createObjectURL(blob);
                    urls.push(url);
                    revoked.push(url);
                }
                setThumbnails(urls);
            } catch {
                setThumbnails([]);
            } finally {
                setLoading(false);
            }
        };
        load();
        return () => {
            revoked.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [zipBlob]);

    if (loading) {
        return (
            <div className={`flex items-center justify-center h-[200px] text-[#888] text-sm font-medium ${className}`}>
                Loading preview…
            </div>
        );
    }

    if (thumbnails.length === 0) {
        return null;
    }

    return (
        <div className={`grid grid-cols-4 md:grid-cols-6 gap-2 p-4 overflow-auto max-h-[300px] ${className}`}>
            {thumbnails.map((url, i) => (
                <div
                    key={i}
                    className="aspect-square rounded-lg overflow-hidden bg-slate-100 border border-black/5"
                >
                    <img
                        src={url}
                        alt={`Page ${i + 1}`}
                        className="w-full h-full object-cover"
                    />
                </div>
            ))}
        </div>
    );
}

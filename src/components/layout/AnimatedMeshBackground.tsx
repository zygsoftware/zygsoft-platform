"use client";

/**
 * Minimal global background — very subtle dot grid only.
 * No blobs, no pulse animations. Reduces visual competition with section content.
 */
export function AnimatedMeshBackground() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                    opacity: 0.5,
                }}
            />
        </div>
    );
}

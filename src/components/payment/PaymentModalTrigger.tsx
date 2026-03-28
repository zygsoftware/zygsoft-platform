"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { PaymentCheckout } from "@/components/payment/PaymentCheckout";
import type { ProductSlug } from "@/components/payment/payment-config";

type PaymentModalTriggerProps = {
    productId?: ProductSlug;
    className: string;
    children: ReactNode;
};

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function PaymentModalTrigger({
    productId = "legal-toolkit",
    className,
    children,
}: PaymentModalTriggerProps) {
    const [open, setOpen] = useState(false);
    const [closeLocked, setCloseLocked] = useState(false);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const canUseDOM = typeof document !== "undefined";

    useEffect(() => {
        if (!open) {
            return;
        }

        const triggerNode = triggerRef.current;
        const scrollY = window.scrollY;
        const previousBodyStyle = {
            overflow: document.body.style.overflow,
            position: document.body.style.position,
            width: document.body.style.width,
            top: document.body.style.top,
        };

        document.body.classList.add("payment-modal-open");
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.width = "100%";
        document.body.style.top = `-${scrollY}px`;

        const panelNode = dialogRef.current;
        const focusable = panelNode?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        const firstFocusable = focusable?.[0];
        window.setTimeout(() => {
            (firstFocusable ?? panelNode)?.focus();
        }, 10);

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                if (!closeLocked) {
                    setOpen(false);
                }
                return;
            }

            if (event.key !== "Tab" || !panelNode) {
                return;
            }

            const elements = Array.from(panelNode.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
                (element) => !element.hasAttribute("disabled") && element.tabIndex !== -1
            );

            if (!elements.length) {
                event.preventDefault();
                panelNode.focus();
                return;
            }

            const first = elements[0];
            const last = elements[elements.length - 1];
            const active = document.activeElement as HTMLElement | null;

            if (event.shiftKey && active === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousBodyStyle.overflow;
            document.body.style.position = previousBodyStyle.position;
            document.body.style.width = previousBodyStyle.width;
            document.body.style.top = previousBodyStyle.top;
            document.body.classList.remove("payment-modal-open");
            window.scrollTo(0, scrollY);
            triggerNode?.focus();
        };
    }, [open, closeLocked]);

    const requestClose = () => {
        if (!closeLocked) {
            setOpen(false);
        }
    };

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen(true)}
                className={className}
                aria-haspopup="dialog"
                aria-expanded={open}
            >
                {children}
            </button>

            {canUseDOM
                ? createPortal(
                      <AnimatePresence>
                          {open ? (
                              <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="fixed inset-0 z-[10000] overflow-hidden"
                              >
                                  <motion.button
                                      type="button"
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      onClick={requestClose}
                                      className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.62),rgba(2,6,23,0.78))] backdrop-blur-xl"
                                      aria-label="Close payment dialog"
                                  />

                                  <div className="relative flex h-full min-h-0 items-center justify-center p-3 sm:p-6">
                                      <motion.div
                                          ref={dialogRef}
                                          initial={{ opacity: 0, y: 28, scale: 0.97 }}
                                          animate={{ opacity: 1, y: 0, scale: 1 }}
                                          exit={{ opacity: 0, y: 20, scale: 0.985 }}
                                          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                                          className="flex h-[min(90vh,920px)] max-h-[90vh] min-h-0 w-[min(1100px,96vw)] max-w-none overflow-hidden outline-none"
                                          role="dialog"
                                          aria-modal="true"
                                          aria-labelledby="payment-checkout-title"
                                          aria-describedby="payment-checkout-subtitle"
                                          tabIndex={-1}
                                      >
                                          <PaymentCheckout
                                              productId={productId}
                                              mode="modal"
                                              onClose={requestClose}
                                              onModalBusyChange={setCloseLocked}
                                          />
                                      </motion.div>
                                  </div>
                              </motion.div>
                          ) : null}
                      </AnimatePresence>,
                      document.body
                  )
                : null}
        </>
    );
}

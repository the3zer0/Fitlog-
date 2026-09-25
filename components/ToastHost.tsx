"use client";

import { useEffect, useState } from "react";

import { TOAST_EVENT } from "@/lib/fitlog";

type Toast = {
  id: number;
  message: string;
};

export default function ToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string }>;
      const message = customEvent.detail?.message;

      if (!message) return;

      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, message }]);

      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 2600);
    };

    window.addEventListener(TOAST_EVENT, handleToast);
    return () => window.removeEventListener(TOAST_EVENT, handleToast);
  }, []);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(90vw,22rem)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto rounded-xl border border-[#ccff00]/60 bg-[#111111] px-4 py-3 text-sm font-medium text-[#f5f5f5] shadow-2xl shadow-[#ccff00]/10"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

"use client";

import { AlertCircle } from "lucide-react";

interface InfoCardProps {
  title: string;
  message: string;
  type?: "info" | "warning" | "error" | "success";
}

export function InfoCard({ title, message, type = "info" }: InfoCardProps) {
  const styles = {
    info: "bg-primary/8 border-primary/20 text-primary",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
    error: "bg-destructive/10 border-destructive/20 text-destructive",
    success: "bg-green-50 border-green-200 text-green-900",
  };

  const iconColor = {
    info: "text-primary",
    warning: "text-yellow-600",
    error: "text-destructive",
    success: "text-green-600",
  };

  return (
    <div className={`rounded-lg border p-4 ${styles[type]}`}>
      <div className="flex gap-3">
        <AlertCircle
          className={`mt-0.5 flex-shrink-0 ${iconColor[type]}`}
          size={20}
        />
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}

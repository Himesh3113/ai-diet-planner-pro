"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";

export function AuthStatusToast() {
  const searchParams = useSearchParams();
  const shownKey = useRef("");
  const { toast } = useToast();

  useEffect(() => {
    const error = searchParams.get("error");
    const message = searchParams.get("message");
    const key = `${error ?? ""}:${message ?? ""}`;

    if (!key || key === ":" || key === shownKey.current) {
      return;
    }

    shownKey.current = key;

    if (error) {
      toast({
        title: "Authentication error",
        description: error,
        variant: "error",
      });
      return;
    }

    if (message) {
      toast({
        title: "Ready",
        description: message,
        variant: "success",
      });
    }
  }, [searchParams, toast]);

  return null;
}

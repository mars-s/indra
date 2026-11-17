"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export function SyncNow() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
      className="h-8 rounded-md border-line bg-transparent px-3 text-[12.5px] font-normal text-dim-2 hover:bg-raised hover:text-fg dark:bg-transparent"
    >
      <RefreshCw strokeWidth={1.5} className={pending ? "animate-spin" : ""} aria-hidden />
      Sync now
    </Button>
  );
}

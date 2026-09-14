"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Package, Plus } from "lucide-react";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { useRouter } from "next/navigation";

interface BatchHeaderProps {
  totalBatches?: number;
  onAddBatch?: () => void;
}

export function BatchHeader({
  // totalBatches = 0,
  onAddBatch,
}: BatchHeaderProps) {
  const { isBangla } = useAppTranslation();
  const router = useRouter();

  return (
    <div className="sticky top-0 z-20  border-b border-border/80">
      <div className="mx-auto py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Title & Description */}
          <div className="flex items-center gap-3">
            <BackButton fallbackHref="/inventory" />

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-foreground tracking-tight">
                  <Package className="h-5 w-5 text-primary" />
                  {isBangla ? "ব্যাচ ট্র্যাকিং ও ম্যানেজমেন্ট" : "Batch Management"}
                </h1>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isBangla
                  ? "সকল ইনভেন্টরি ব্যাচের মেয়াদ, স্টক পরিমাণ এবং হিস্ট্রি পরিচালনা করুন"
                  : "Track product lots, monitor expiries, cost prices, and stock movements"}
              </p>
            </div>
          </div>

          {/* Primary Actions (Right) */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={onAddBatch || (() => router.push("/inventory/new"))}
              className="h-9 text-xs font-bold gap-1.5 cursor-pointer shadow-xs flex"
            >
              <Plus className="h-4 w-4" />
              {isBangla ? "নতুন ব্যাচ" : "Add Batch"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

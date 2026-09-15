// Hello Khata - Adjustment Details Modal
// Modal to view details of an adjustment transaction with clean plain text

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Calendar,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
} from "lucide-react";
import { useGetAdjustBalance } from "@/hooks/api/usePayments";
import {
  useAppTranslation,
  useCurrency,
  useDateFormat,
} from "@/hooks/useAppTranslation";
import { cn } from "@/lib/utils";

interface AdjustmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
  party?: any;
}

export function AdjustmentDetailsModal({
  isOpen,
  onClose,
  id,
  party,
}: AdjustmentDetailsModalProps) {
  const { isBangla } = useAppTranslation();
  const { formatCurrency } = useCurrency();
  const { formatDate } = useDateFormat();

  // Fetch adjustment data
  const { data: adjustResponse, isLoading: isAdjustLoading } = useGetAdjustBalance(id);
  const entry = adjustResponse?.data;

  const renderAdjustmentView = () => {
    if (isAdjustLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-sm text-muted-foreground">
            {isBangla ? "লোড হচ্ছে..." : "Loading details..."}
          </p>
        </div>
      );
    }

    if (!entry) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-sm text-rose-500">
            {isBangla ? "লেনদেন বিবরণ পাওয়া যায়নি" : "Adjustment details not found."}
          </p>
        </div>
      );
    }

    const isReduce = entry.type === 'reduce_balance' || entry.amount < 0;
    const amountVal = Math.abs(entry.amount || 0);
    const partyName = entry.partyName || party?.name || "—";
    const dateVal = entry.date ? new Date(entry.date) : (entry.createdAt ? new Date(entry.createdAt) : new Date());
    const remarks = entry.remarks || entry.description || entry.notes || "";

    return (
      <div className="space-y-6">
        {/* Main Amount & Type Card */}
        <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              {isBangla ? "সমন্বয় পরিমাণ" : "Adjustment Amount"}
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  "text-3xl font-extrabold font-mono tracking-tight",
                  isReduce ? "text-rose-500" : "text-emerald-500 dark:text-emerald-400"
                )}
              >
                {isReduce ? "-" : "+"} {formatCurrency(amountVal)}
              </span>
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5",
              isReduce
                ? "bg-rose-500/10 text-rose-500 border-rose-500/30"
                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
            )}
          >
            {isReduce ? (
              <>
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>{isBangla ? "ব্যালেন্স হ্রাস (Decrease)" : "Decrease Balance"}</span>
              </>
            ) : (
              <>
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{isBangla ? "ব্যালেন্স বৃদ্ধি (Increase)" : "Increase Balance"}</span>
              </>
            )}
          </Badge>
        </div>

        {/* Transaction Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl border border-border/60 bg-card/60">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              {isBangla ? "পার্টির নাম:" : "Party Name:"}
            </span>
            <p className="text-sm font-bold text-foreground">
              {partyName}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              {isBangla ? "তারিখ:" : "As of Date:"}
            </span>
            <p className="text-sm font-bold text-foreground font-mono">
              {formatDate(dateVal, "long")}
            </p>
          </div>
        </div>

        {/* Remarks Box */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-primary" />
            {isBangla ? "মন্তব্য ও কারণ:" : "Remarks & Reason:"}
          </span>
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 text-sm text-foreground leading-relaxed min-h-[64px]">
            {remarks ? (
              <p className="whitespace-pre-wrap">{remarks}</p>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                {isBangla ? "কোনো মন্তব্য লেখা হয়নি" : "No remarks provided"}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderFooterButtons = () => {
    return (
      <div className="flex items-center justify-end w-full">
        <Button
          variant="outline"
          onClick={onClose}
          className="h-10 text-xs px-5 rounded-xl border-border hover:bg-muted"
        >
          {isBangla ? "বন্ধ করুন" : "Close"}
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[95%] max-w-lg md:max-w-xl rounded-3xl p-6 overflow-hidden max-h-[90vh] flex flex-col justify-between border border-border bg-card shadow-2xl">
        <div className="flex flex-col flex-1 min-h-0">
          <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
            <DialogTitle className="text-lg font-bold text-foreground">
              {isBangla ? "ব্যালেন্স সমন্বয় বিবরণ" : "Adjustment Details"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-5 overflow-y-auto max-h-[60vh] pr-1 flex-1">
            {renderAdjustmentView()}
          </div>
        </div>
        <DialogFooter className="pt-4 border-t border-border mt-3 shrink-0 flex items-center w-full">
          {renderFooterButtons()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

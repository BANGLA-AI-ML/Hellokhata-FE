// Hello Khata - Opening Balance Details Modal
// Modal to view details of an opening balance transaction with clean plain text

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
  Calendar,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  DollarSign,
} from "lucide-react";
import { useGetOpeningBalance } from "@/hooks/api/usePayments";
import {
  useAppTranslation,
  useCurrency,
  useDateFormat,
} from "@/hooks/useAppTranslation";
import { cn } from "@/lib/utils";

interface OpeningBalanceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: any;
  party?: any;
}

export function OpeningBalanceDetailsModal({
  isOpen,
  onClose,
  entry,
  party,
}: OpeningBalanceDetailsModalProps) {
  const { isBangla } = useAppTranslation();
  const { formatCurrency } = useCurrency();
  const { formatDate } = useDateFormat();

  const partyId = party?.id || entry?.partyId;
  const { data: openingBalanceResponse } = useGetOpeningBalance(partyId);

  const ob = openingBalanceResponse?.data || openingBalanceResponse || entry;

  const rawAmount = ob?.amount != null ? Number(ob.amount) : (entry?.amount != null ? Number(entry.amount) : 0);
  const amountVal = Math.abs(rawAmount);
  const balanceDirection = ob?.balanceDirection || entry?.balanceDirection || (rawAmount >= 0 ? 'receive' : 'give');
  const isReceive = balanceDirection === 'receive';
  const partyName = party?.name || ob?.partyName || entry?.partyName || "—";
  const dateVal = ob?.date || ob?.createdAt || entry?.date || entry?.createdAt ? new Date(ob?.date || ob?.createdAt || entry?.date || entry?.createdAt) : new Date();
  const remarks = ob?.remarks || ob?.notes || entry?.remarks || entry?.notes || "";

  if (!entry && !ob) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[95%] max-w-lg md:max-w-xl rounded-3xl p-6 overflow-hidden max-h-[90vh] flex flex-col justify-between border border-border bg-card shadow-2xl">
        <div className="flex flex-col flex-1 min-h-0">
          <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
            <DialogTitle className="text-lg font-bold text-foreground">
              {isBangla ? "প্রারম্ভিক ব্যালেন্স বিবরণ" : "Opening Balance Details"}
            </DialogTitle>
          </DialogHeader>

          <div className="py-5 overflow-y-auto max-h-[60vh] pr-1 flex-1 space-y-6">
            {/* Amount & Direction Card */}
            <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  {isBangla ? "প্রারম্ভিক ব্যালেন্স" : "Opening Amount"}
                </span>
                <span
                  className={cn(
                    "text-3xl font-extrabold font-mono tracking-tight",
                    isReceive ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500"
                  )}
                >
                  {formatCurrency(amountVal)}
                </span>
              </div>

              <Badge
                variant="outline"
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5",
                  isReceive
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-500 border-rose-500/30"
                )}
              >
                {isReceive ? (
                  <>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{isBangla ? "পাওনা (To Receive)" : "To Receive"}</span>
                  </>
                ) : (
                  <>
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>{isBangla ? "দেনা (To Give)" : "To Give"}</span>
                  </>
                )}
              </Badge>
            </div>

            {/* Metadata Grid */}
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
                  {isBangla ? "হিসাব শুরুর তারিখ:" : "As of Date:"}
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
                {isBangla ? "মন্তব্য:" : "Remarks / Notes:"}
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
        </div>

        <DialogFooter className="pt-4 border-t border-border mt-3 shrink-0 flex items-center justify-end w-full">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-10 text-xs px-5 rounded-xl border-border hover:bg-muted"
          >
            {isBangla ? "বন্ধ করুন" : "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hello Khata - Payment Details Modal
// Modal to view details of a payment transaction with clean plain text

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
  Printer,
  User,
  CreditCard,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { useGetPaymentById } from "@/hooks/api/usePayments";
import { useParty } from "@/hooks/api/useParties";
import {
  useAppTranslation,
  useCurrency,
  useDateFormat,
} from "@/hooks/useAppTranslation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
}

export function PaymentDetailsModal({
  isOpen,
  onClose,
  paymentId,
}: PaymentDetailsModalProps) {
  const { isBangla } = useAppTranslation();
  const { formatCurrency } = useCurrency();
  const { formatDate } = useDateFormat();

  const { data: paymentResponse, isLoading: isPaymentLoading } = useGetPaymentById(paymentId);
  const entry = paymentResponse?.data || paymentResponse;

  const partyId = entry?.partyId;
  const { data: partyResponse } = useParty(partyId || "", { enabled: !!partyId });
  const party = partyResponse?.data || partyResponse;

  const handlePrint = () => {
    toast.success(isBangla ? "প্রিন্ট হচ্ছে..." : "Connecting to printer...");
    window.print();
  };

  const isPaymentIn = entry?.type ? entry.type === 'received' : (entry?.amount != null ? entry.amount >= 0 : true);
  const amountVal = Math.abs(entry?.amount || 0);

  const getModalTitle = () => {
    if (isPaymentLoading || !entry) return isBangla ? "পেমেন্ট বিবরণ" : "Payment Details";
    return isPaymentIn
      ? isBangla
        ? "পেমেন্ট ইন (জমা) বিবরণ"
        : "Payment In Details"
      : isBangla
        ? "পেমেন্ট আউট (প্রদান) বিবরণ"
        : "Payment Out Details";
  };

  const renderPaymentView = () => {
    if (isPaymentLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-sm text-muted-foreground">
            {isBangla ? "লোড হচ্ছে..." : "Loading payment details..."}
          </p>
        </div>
      );
    }

    if (!entry) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-sm text-rose-500">
            {isBangla ? "লেনদেন বিবরণ পাওয়া যায়নি" : "Payment details not found."}
          </p>
        </div>
      );
    }

    const receiptNo = entry.receiptNumber || entry.receiptNo || entry.referenceId || entry.reference || "—";
    const partyName = entry.partyName || party?.name || "—";
    const dateVal = entry.date || entry.createdAt ? new Date(entry.date || entry.createdAt) : new Date();
    const paymentMethod = entry.paymentMethod || entry.mode || "Cash";
    const remarks = entry.remarks || entry.notes || "";

    return (
      <div className="space-y-6">
        {/* Amount & Type Card */}
        <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              {isPaymentIn
                ? isBangla ? "প্রাপ্ত পরিমাণ (Received)" : "Received Amount"
                : isBangla ? "পরিশোধিত পরিমাণ (Paid)" : "Paid Amount"}
            </span>
            <span
              className={cn(
                "text-3xl font-extrabold font-mono tracking-tight",
                isPaymentIn ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500"
              )}
            >
              {formatCurrency(amountVal)}
            </span>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5",
              isPaymentIn
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                : "bg-rose-500/10 text-rose-500 border-rose-500/30"
            )}
          >
            {isPaymentIn ? (
              <>
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>{isBangla ? "পেমেন্ট গ্রহণ (Payment In)" : "Payment In"}</span>
              </>
            ) : (
              <>
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{isBangla ? "পেমেন্ট প্রদান (Payment Out)" : "Payment Out"}</span>
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
              {isBangla ? "পেমেন্টের তারিখ:" : "Payment Date:"}
            </span>
            <p className="text-sm font-bold text-foreground font-mono">
              {formatDate(dateVal, "long")}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" />
              {isBangla ? "রসিদ / রেফারেন্স নং:" : "Receipt / Ref No:"}
            </span>
            <p className="text-sm font-bold text-foreground font-mono">
              #{receiptNo}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-primary" />
              {isBangla ? "পেমেন্ট মাধ্যম:" : "Payment Method:"}
            </span>
            <p className="text-sm font-bold text-foreground capitalize">
              {paymentMethod}
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
    );
  };

  const renderFooterButtons = () => {
    return (
      <div className="flex flex-row items-center justify-between w-full gap-4">
        <Button
          variant="outline"
          onClick={handlePrint}
          className="h-10 text-xs font-semibold flex items-center gap-1.5 rounded-xl border-border text-foreground hover:bg-muted"
        >
          <Printer className="h-4 w-4" />
          {isBangla ? "প্রিন্ট" : "Print"}
        </Button>
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
              {getModalTitle()}
            </DialogTitle>
          </DialogHeader>

          <div className="py-5 overflow-y-auto max-h-[60vh] pr-1 flex-1">
            {renderPaymentView()}
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-border mt-3 shrink-0 flex items-center w-full">
          {renderFooterButtons()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

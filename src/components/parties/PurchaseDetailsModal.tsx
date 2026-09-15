"use client";

import { useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  Trash2,
  Edit,
  Printer,
  Calendar,
  CreditCard,
  Building2,
  FileSpreadsheet,
} from "lucide-react";
import { useGetPurchaseById } from "@/hooks/api/usePurchases";
import { useRouter } from "next/navigation";
import {
  useAppTranslation,
  useCurrency,
  useDateFormat,
} from "@/hooks/useAppTranslation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PurchaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseId: string;
}

export function PurchaseDetailsModal({
  isOpen,
  onClose,
  purchaseId,
}: PurchaseDetailsModalProps) {
  const { isBangla } = useAppTranslation();
  const { formatCurrency } = useCurrency();
  const { formatDate } = useDateFormat();
  const router = useRouter();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: purchaseData, isLoading: isPurchaseLoading } = useGetPurchaseById(purchaseId);

  const handleEditRedirect = () => {
    onClose();
    router.push(`/purchases/${purchaseId}/edit`);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    toast.warning(
      isBangla
        ? "সরাসরি লেনদেন ডিলিট করা অনুমোদিত নয়"
        : "Direct deletion is not allowed",
      {
        description: isBangla
          ? "হিসাবের ধারাবাহিকতা বজায় রাখার জন্য একটি ক্রেডিট নোট বা রিটার্ন তৈরি করুন।"
          : "Please create a return or adjustment to reverse this transaction.",
      },
    );
    setShowDeleteConfirm(false);
  };

  const handlePrint = () => {
    toast.success(isBangla ? "প্রিন্ট হচ্ছে..." : "Connecting to printer...");
    window.print();
  };

  const renderInvoiceView = () => {
    if (isPurchaseLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-sm text-muted-foreground">
            {isBangla ? "লোড হচ্ছে..." : "Loading transaction details..."}
          </p>
        </div>
      );
    }

    const txData = purchaseData?.data || purchaseData;
    const party = txData?.party;
    const items = txData?.items || [];

    const partyName =
      txData?.partyName || party?.name || (isBangla ? "সাপ্লায়ার" : "Supplier");
    const invoiceNo = txData?.invoiceNo || purchaseId || "—";
    const invoiceDate = txData?.createdAt || txData?.date
      ? formatDate(txData.createdAt || txData.date, "long")
      : "—";
    const paymentMode = txData?.paymentMethod || txData?.mode || "Cash";

    const balanceVal = party?.currentBalance ?? 0;
    const balanceText = isBangla
      ? `৳ ${Math.abs(balanceVal).toLocaleString()} (${balanceVal >= 0 ? "পাওনা" : "দেনা"})`
      : `Tk. ${Math.abs(balanceVal).toLocaleString()} (${balanceVal >= 0 ? "To Receive" : "To Pay"})`;

    return (
      <div className="space-y-6">
        {/* Profile and Meta Plain Text Grid */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div>
              <span className="text-xs font-semibold text-muted-foreground block mb-0.5">
                {isBangla ? "সাপ্লায়ার / পার্টি:" : "Supplier / Party:"}
              </span>
              <span className="font-bold text-foreground text-base">
                {partyName}
              </span>
            </div>
            {party && (
              <div>
                <span className="text-xs font-semibold text-muted-foreground block mb-0.5">
                  {isBangla ? "বর্তমান ব্যালেন্স:" : "Current Balance:"}
                </span>
                <span
                  className={cn(
                    "font-bold font-mono text-sm",
                    balanceVal >= 0
                      ? "text-primary font-semibold"
                      : "text-rose-500",
                  )}
                >
                  {balanceText}
                </span>
              </div>
            )}
          </div>

          <div className="text-left sm:text-right space-y-1.5">
            <div className="flex items-center sm:justify-end gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {isBangla ? "বিল / ইনভয়েস নং:" : "Bill / Invoice No:"}
              </span>
              <span className="font-bold text-foreground font-mono">#{invoiceNo}</span>
            </div>
            <div className="flex items-center sm:justify-end gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {isBangla ? "বিল তারিখ:" : "Bill Date:"}
              </span>
              <span className="font-bold text-foreground">{invoiceDate}</span>
            </div>
            <div className="flex items-center sm:justify-end gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {isBangla ? "পেমেন্ট মোড:" : "Payment Mode:"}
              </span>
              <Badge variant="outline" className="font-bold uppercase text-[11px] bg-background">
                {paymentMode}
              </Badge>
            </div>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="border border-border/80 rounded-2xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/60 text-xs font-bold border-b border-border">
              <TableRow>
                <TableHead className="w-12 py-3 px-4 text-center">
                  {isBangla ? "ক্রমিক" : "S.N."}
                </TableHead>
                <TableHead className="py-3 px-4">
                  {isBangla ? "আইটেমের নাম" : "Item Name"}
                </TableHead>
                <TableHead className="py-3 px-3 text-right">
                  {isBangla ? "পরিমাণ" : "Quantity"}
                </TableHead>
                <TableHead className="py-3 px-3 text-right">
                  {isBangla ? "ক্রয় দর" : "Unit Cost"}
                </TableHead>
                <TableHead className="py-3 px-4 text-right">
                  {isBangla ? "মোট" : "Amount"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-20 text-center text-muted-foreground italic"
                  >
                    {isBangla ? "কোনো আইটেম পাওয়া যায়নি" : "No items found"}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item: any, idx: number) => {
                  const price = item.unitCost || item.unitPrice || 0;
                  const qty = item.quantity || 0;
                  return (
                    <TableRow
                      key={idx}
                      className="hover:bg-muted/10 border-b border-border/50 transition-colors"
                    >
                      <TableCell className="text-center py-3.5 px-4 text-muted-foreground font-mono">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-semibold py-3.5 px-4 text-foreground">
                        {item.itemName || item.name || "—"}
                      </TableCell>
                      <TableCell className="text-right py-3.5 px-3 font-mono font-medium">
                        {qty} {item.unit || ""}
                      </TableCell>
                      <TableCell className="text-right py-3.5 px-3 font-mono text-muted-foreground">
                        {formatCurrency(price)}
                      </TableCell>
                      <TableCell className="text-right py-3.5 px-4 font-bold text-foreground font-mono">
                        {formatCurrency(qty * price)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Calculations / Totals */}
        <div className="flex flex-col items-end space-y-2 pt-2 text-xs max-w-[260px] ml-auto">
          <div className="flex justify-between w-full text-muted-foreground font-medium">
            <span>{isBangla ? "উপমোট:" : "Sub Total:"}</span>
            <span className="font-mono text-foreground font-semibold">
              {formatCurrency(txData?.subtotal || txData?.total || 0)}
            </span>
          </div>
          {txData?.discount > 0 && (
            <div className="flex justify-between w-full text-yellow-600 dark:text-yellow-400 font-medium">
              <span>{isBangla ? "ছাড়:" : "Discount:"}</span>
              <span className="font-mono">
                -{formatCurrency(txData.discount)}
              </span>
            </div>
          )}
          {txData?.tax > 0 && (
            <div className="flex justify-between w-full text-muted-foreground font-medium">
              <span>{isBangla ? "ভ্যাট/ট্যাক্স:" : "Tax:"}</span>
              <span className="font-mono text-foreground font-semibold">
                +{formatCurrency(txData.tax)}
              </span>
            </div>
          )}
          <div className="flex justify-between w-full text-sm font-bold border-t border-border/80 pt-2 text-foreground">
            <span>{isBangla ? "মোট বিল:" : "Total Bill:"}</span>
            <span className="font-mono text-base font-extrabold">
              {formatCurrency(txData?.total || 0)}
            </span>
          </div>
          <div className="flex justify-between w-full text-primary font-bold">
            <span>{isBangla ? "পরিশোধিত:" : "Paid Amount:"}</span>
            <span className="font-mono">
              {formatCurrency(txData?.paidAmount || 0)}
            </span>
          </div>
          {txData?.dueAmount > 0 && (
            <div className="flex justify-between w-full text-rose-600 dark:text-rose-400 font-extrabold border-t border-dashed border-border/85 pt-2 text-sm">
              <span>{isBangla ? "বকেয়া পরিমাণ:" : "Amount Due:"}</span>
              <span className="font-mono text-base font-black">
                {formatCurrency(txData.dueAmount)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFooterButtons = () => {
    return (
      <div className="flex flex-row items-center justify-between w-full gap-4">
        <Button
          variant="outline"
          onClick={handleDeleteClick}
          className="h-10 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-border text-xs rounded-xl"
        >
          <Trash2 className="h-4 w-4 mr-1.5" />
          {isBangla ? "মুছুন" : "Delete"}
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleEditRedirect}
            className="h-10 text-foreground hover:bg-muted border-border text-xs rounded-xl flex items-center gap-1.5"
          >
            <Edit className="h-4 w-4" />
            {isBangla ? "সম্পাদনা" : "Edit"}
          </Button>
          <Button
            onClick={handlePrint}
            className="h-10 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold flex items-center gap-1.5 rounded-xl shadow-sm"
          >
            <Printer className="h-4 w-4" />
            {isBangla ? "প্রিন্ট" : "Print"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="w-[95%] max-w-lg md:max-w-3xl rounded-3xl p-6 overflow-hidden max-h-[90vh] flex flex-col justify-between border border-border bg-card shadow-2xl">
          <div className="flex flex-col flex-1 min-h-0">
            <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
              <DialogTitle className="text-lg font-bold text-foreground">
                {isBangla ? "ক্রয় বিল বিবরণ" : "Purchase Bill Details"}
              </DialogTitle>
            </DialogHeader>

            <div className="py-5 overflow-y-auto max-h-[60vh] pr-1 flex-1">
              {renderInvoiceView()}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border mt-3 shrink-0 flex items-center w-full">
            {renderFooterButtons()}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="w-[95%] max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isBangla ? "লেনদেন মুছবেন?" : "Delete Transaction?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              {isBangla
                ? "এই কাজ পূর্বাবস্থায় ফেরানো যাবে না। লেনদেনটি স্থায়ীভাবে মুছে ফেলা হবে।"
                : "This action cannot be undone. This transaction will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs rounded-xl">
              {isBangla ? "বাতিল" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs rounded-xl"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              {isBangla ? "মুছুন" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

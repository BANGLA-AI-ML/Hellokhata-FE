"use client";

import { useState, useEffect } from "react";
import {
  useDateFormat,
  useAppTranslation,
  useCurrency,
} from "@/hooks/useAppTranslation";
import { useParty, useDeleteParty, usePartyLedger } from "@/hooks/api/useParties";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Trash2,
  Plus,
  CreditCard,
  ChevronLeft,
  Loader2,
  AlertTriangle,
  Edit,
  BellRing,
  MessageSquare,
  Send,
  FileCheck,
  FileX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "./utils";
import { AddPaymentInModal } from "./AddPaymentInModal";
import { AddPaymentOutModal } from "./AddPaymentOutModal";
import { AdjustBalanceModal } from "./AdjustBalanceModal";
import { AddReminderModal } from "./AddReminderModal";
import { PaginationHelper } from "@/components/shared/PaginationHelper";
import { SaleDetailsModal } from "./SaleDetailsModal";
import { PurchaseDetailsModal } from "./PurchaseDetailsModal";
import { PaymentDetailsModal } from "./PaymentDetailsModal";
import { AdjustmentDetailsModal } from "./AdjustmentDetailsModal";
import { OpeningBalanceDetailsModal } from "./OpeningBalanceDetailsModal";
import { EditPartyModal } from "./EditPartyModal";

interface PartyDetailsAndTransactionsProps {
  partyId: string;
  onClose: () => void;
}

export function PartyDetailsAndTransactions({
  partyId,
  onClose,
}: PartyDetailsAndTransactionsProps) {
  const { t, isBangla } = useAppTranslation();
  const { formatCurrency } = useCurrency();
  const router = useRouter();

  const { data: partyDetailData, isLoading, error } = useParty(partyId);
  const { formatDate } = useDateFormat();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { mutate: deleteParty, isPending: isDeleting } = useDeleteParty();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedTransaction(null);
  }, [partyId]);

  const {
    data: ledgerData,
    isLoading: isLedgerLoading,
    isFetching: isLedgerFetching,
  } = usePartyLedger(partyId, {
    page: currentPage,
    limit: itemsPerPage,
  });

  const [showPaymentInModal, setShowPaymentInModal] = useState(false);
  const [showPaymentOutModal, setShowPaymentOutModal] = useState(false);
  const [showAdjustBalanceModal, setShowAdjustBalanceModal] = useState(false);
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  const [showEditPartyModal, setShowEditPartyModal] = useState(false);

  const party = partyDetailData?.data;
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 flex-1 my-auto">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">
          {isBangla ? "লোড হচ্ছে..." : "Loading details..."}
        </p>
      </div>
    );
  }

  if (error || !party) {
    return (
      <div className="flex flex-col items-center justify-center py-12 flex-1 my-auto text-red-500">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p className="text-sm font-medium">
          {isBangla ? "তথ্য লোড করতে ব্যর্থ হয়েছে" : "Failed to load details"}
        </p>
      </div>
    );
  }

  const handleDelete = () => {
    deleteParty(partyId, {
      onSuccess: () => {
        toast({
          title: isBangla
            ? "পার্টি মুছে ফেলা হয়েছে"
            : "Party deleted successfully",
        });
        onClose();
      },
    });
  };

  const getStatusContent = (entry: any) => {
    let status = (entry.status || "").toLowerCase();

    // Fallback calculation logic if status is not provided by the API
    if (!status) {
      if (entry.type === "payment") {
        status = "paid";
      } else if (entry.type === "sale" || entry.type === "purchase") {
        const paid = entry.paidAmount ?? 0;
        const due = entry.dueAmount ?? 0;
        if (due <= 0) {
          status = "paid";
        } else if (paid > 0) {
          status = "partial";
        } else {
          status = "unpaid";
        }
      } else {
        status = "completed";
      }
    }

    const due = entry.dueAmount ?? 0;

    let badgeClass = "bg-muted text-muted-foreground";
    if (status === "paid" || status === "completed" || status === "received") {
      badgeClass = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400";
    } else if (status === "partial") {
      badgeClass = "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400";
    } else if (status === "unpaid" || status === "pending") {
      badgeClass = "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400";
    }

    // Translate status labels
    let label = status.toUpperCase();
    if (isBangla) {
      if (status === "paid" || status === "completed" || status === "received") label = "পরিশোধিত";
      else if (status === "partial") label = "আংশিক";
      else if (status === "unpaid" || status === "pending") label = "অপরিশোধিত";
    } else {
      if (status === "paid" || status === "completed" || status === "received") label = "PAID";
      else if (status === "partial") label = "PARTIAL";
      else if (status === "unpaid" || status === "pending") label = "UNPAID";
    }

    return (
      <div className="flex flex-col items-start">
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase", badgeClass)}>
          {label}
        </span>
        {status === "partial" && due > 0 && (
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5 whitespace-nowrap">
            {isBangla ? "বাকি" : "Unpaid"} {formatCurrency(due)}
          </span>
        )}
      </div>
    );
  };

  const ledgerEntries = ledgerData?.data?.entries || [];
  const totalPages = ledgerData?.meta?.totalPages || 1;
  const totalTransactions = ledgerData?.meta?.total || 0;

  const isReceivable = party.currentBalance >= 0;

  const advanceBalance = party.advanceBalance ?? party.advance ?? 0;

  const totalPurchase = party.totalPurchase ?? party.totalPurchases ?? party.purchaseSummary?.total ?? 0;
  const purchaseInvoice = party.purchaseInvoice ?? party.purchaseSummary?.invoice ?? 0;
  const purchaseCustom = party.purchaseCustom ?? party.purchaseSummary?.custom ?? 0;

  const totalPaid = party.totalPaid ?? party.totalPayments ?? party.paidSummary?.total ?? 0;
  const paidInvoice = party.paidInvoice ?? party.paidSummary?.invoice ?? 0;
  const paidCustom = party.paidCustom ?? party.paidSummary?.custom ?? 0;

  const totalDue = party.totalDue ?? party.dueSummary?.total ?? (party.currentBalance < 0 ? Math.abs(party.currentBalance) : 0);
  const dueInvoice = party.dueInvoice ?? party.dueSummary?.invoice ?? 0;
  const dueEmi = party.dueEmi ?? party.dueSummary?.emi ?? 0;
  const dueCustom = party.dueCustom ?? party.dueSummary?.custom ?? 0;

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Top Details section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-9 w-9 p-0 flex items-center justify-center"
            onClick={onClose}
          >
            <ChevronLeft className="h-6 w-6 text-foreground" />
          </Button>
          <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shrink-0">
            {getInitials(party.name)}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-foreground truncate">
              {party.name}
            </h2>
            {party.phone && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {party.phone}
              </p>
            )}
            {party.address && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {party.address}
              </p>
            )}
          </div>

        </div>

        <div className="text-right shrink-0">
          <span className="text-xs text-muted-foreground font-semibold block uppercase tracking-wider">
            {isReceivable
              ? isBangla
                ? "পাওনা"
                : "Receivable"
              : isBangla
                ? "দেনা"
                : "Payable"}
          </span>
          <span
            className={cn(
              "text-2xl font-extrabold block mt-0.5",
              party.currentBalance > 0
                ? "text-emerald-600"
                : party.currentBalance < 0
                  ? "text-red-600"
                  : "text-foreground",
            )}
          >
            {formatCurrency(Math.abs(party.currentBalance))}
          </span>
        </div>
      </div>

      {/* Quick Action buttons */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
                onClick={() => setShowEditPartyModal(true)}
              >
                <Edit className="h-3.5 w-3.5 mr-2" />
                {isBangla ? "সম্পাদনা করুন" : "Edit Party"}
              </Button>
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-input hover:bg-accent hover:text-accent-foreground text-foreground h-9 px-4 text-xs font-semibold flex items-center gap-1.5"
              >
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                {isBangla ? "পার্টি পরিচালনা" : "Manage Party"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40 text-xs">
              <DropdownMenuItem
                onClick={() => setShowEditPartyModal(true)}
              >
                <Edit className="h-3.5 w-3.5 mr-2" />
                {isBangla ? "সম্পাদনা করুন" : "Edit Party"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                {isBangla ? "মুছে ফেলুন" : "Delete Party"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddReminderModal(true)}
          className="text-yellow-200 bg-yellow-500/50 h-9 px-4 text-xs font-semibold flex items-center gap-1.5"
        >
          <BellRing className="h-3.5 w-3.5" />
          {isBangla ? "তাগাদা পাঠান" : "Send Reminder"}
        </Button>
      </div>

      {/* Summary Cards */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
 
        <div className="bg-[#f0f3ff] dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/30 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white dark:bg-indigo-900/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs shrink-0">
                <MessageSquare className="h-3.5 w-3.5" />
              </div>
              <span className="text-indigo-600 dark:text-indigo-400 font-medium text-xs">
                {isBangla ? "এডভান্স ব্যালেন্স" : "Advance Balance"}
              </span>
            </div>
            <span className="text-indigo-700 dark:text-indigo-300 font-bold text-sm">
              {formatCurrency(advanceBalance)}
            </span>
          </div>
        </div>

        <div className="bg-[#f6f2fe] dark:bg-purple-950/20 border border-purple-100/60 dark:border-purple-900/30 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white dark:bg-purple-900/80 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-xs shrink-0">
                <Send className="h-3.5 w-3.5" />
              </div>
              <span className="text-purple-600 dark:text-purple-400 font-medium text-xs">
                {isBangla ? "মোট ক্রয়" : "Total Purchase"}
              </span>
            </div>
            <span className="text-purple-700 dark:text-purple-300 font-bold text-sm">
              {formatCurrency(totalPurchase)}
            </span>
          </div>
          <div className="mt-2.5 space-y-0.5 text-[11px] text-muted-foreground font-medium">
            <div className="flex justify-between items-center">
              <span>{isBangla ? "ইনভয়েস" : "Invoice"}</span>
              <span>{formatCurrency(purchaseInvoice)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>{isBangla ? "কাস্টম" : "Custom"}</span>
              <span>{formatCurrency(purchaseCustom)}</span>
            </div>
          </div>
        </div>

      
        <div className="bg-[#f0fdf4] dark:bg-emerald-950/20 border border-emerald-100/60 dark:border-emerald-900/30 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white dark:bg-emerald-900/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs shrink-0">
                <FileCheck className="h-3.5 w-3.5" />
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium text-xs">
                {isBangla ? "মোট পরিশোধ" : "Total Paid"}
              </span>
            </div>
            <span className="text-emerald-700 dark:text-emerald-300 font-bold text-sm">
              {formatCurrency(totalPaid)}
            </span>
          </div>
          <div className="mt-2.5 space-y-0.5 text-[11px] text-muted-foreground font-medium">
            <div className="flex justify-between items-center">
              <span>{isBangla ? "ইনভয়েস" : "Invoice"}</span>
              <span>{formatCurrency(paidInvoice)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>{isBangla ? "কাস্টম" : "Custom"}</span>
              <span>{formatCurrency(paidCustom)}</span>
            </div>
          </div>
        </div>

  
        <div className="bg-[#fef2f2] dark:bg-rose-950/20 border border-rose-100/60 dark:border-rose-900/30 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white dark:bg-rose-900/80 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-xs shrink-0">
                <FileX className="h-3.5 w-3.5" />
              </div>
              <span className="text-rose-600 dark:text-rose-400 font-medium text-xs">
                {isBangla ? "মোট বাকি" : "Total Due"}
              </span>
            </div>
            <span className="text-rose-700 dark:text-rose-300 font-bold text-sm">
              {formatCurrency(totalDue)}
            </span>
          </div>
          <div className="mt-2.5 space-y-0.5 text-[11px] text-muted-foreground font-medium">
            <div className="flex justify-between items-center">
              <span>{isBangla ? "ইনভয়েস" : "Invoice"}</span>
              <span>{formatCurrency(dueInvoice)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>{isBangla ? "ইএমআই" : "EMI"}</span>
              <span>{formatCurrency(dueEmi)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>{isBangla ? "কাস্টম" : "Custom"}</span>
              <span>{formatCurrency(dueCustom)}</span>
            </div>
          </div>
        </div>
      </div> */}

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="w-[320px]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isBangla ? "পার্টি মুছবেন?" : "Delete Party?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isBangla
                ? "এই কাজ পূর্বাবস্থায় ফেরানো যাবে না। পার্টিটি স্থায়ীভাবে মুছে ফেলা হবে।"
                : "This action cannot be undone. This party will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {isBangla ? "বাতিল" : "Cancel"}
            </AlertDialogCancel>
            <Button
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {isBangla ? "মুছুন" : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transactions Section */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between gap-4 mt-6 pb-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            {isBangla
              ? `লেনদেন (${totalTransactions})`
              : `Transactions (${totalTransactions})`}
          </h3>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-4 text-xs font-semibold flex items-center gap-1 shrink-0">
                  <Plus className="h-3.5 w-3.5" />
                  {isBangla ? "লেনদেন যোগ" : "Add Transaction"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 text-xs">
                <DropdownMenuItem
                  onClick={() => router.push(`/sales/new?partyId=${party.id}`)}
                >
                  {isBangla ? "নতুন বিক্রয়" : "New Sale"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/purchases/new?partyId=${party.id}`)
                  }
                >
                  {isBangla ? "নতুন ক্রয়" : "New Purchase"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/sales/quotations/new?partyId=${party.id}`)
                  }
                >
                  {isBangla ? "নতুন কোটেশন" : "New Quotation"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowPaymentInModal(true)}>
                  {isBangla ? "পেমেন্ট গ্রহণ" : "Payment In"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowPaymentOutModal(true)}>
                  {isBangla ? "পেমেন্ট প্রদান" : "Payment Out"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowAdjustBalanceModal(true)}
                >
                  {isBangla ? "ব্যালেন্স সমন্বয়" : "Adjust Balance"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="border border-border rounded-xl overflow-hidden bg-transparent shadow-sm flex-1 min-h-[300px] flex flex-col justify-between relative">
          {isLedgerLoading ? (
            <div className="p-8 text-center text-muted-foreground my-auto flex flex-col items-center justify-center h-full min-h-[250px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm">
                {isBangla ? "লোড হচ্ছে..." : "Loading transactions..."}
              </p>
            </div>
          ) : ledgerEntries.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground my-auto flex flex-col items-center justify-center h-full min-h-[250px]">
              <CreditCard className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm">
                {isBangla ? "কোনো লেনদেন পাওয়া যায়নি" : "No transactions found"}
              </p>
            </div>
          ) : (
            <>
              <div className={cn("overflow-x-auto max-h-[450px] flex-1", isLedgerFetching && "opacity-50 transition-opacity")}>
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground text-xs font-semibold uppercase sticky top-0 border-b border-border z-10">
                    <tr>
                      <th className="px-6 py-3">{isBangla ? "ধরন" : "Type"}</th>
                      <th className="px-6 py-3">{isBangla ? "তারিখ" : "Date"}</th>
                      <th className="px-6 py-3 text-right">
                        {isBangla ? "মোট" : "Total"}
                      </th>
                      <th className="px-6 py-3 text-right">
                        {isBangla ? "পরিশোধিত" : "Paid Amount"}
                      </th>
                      <th className="px-6 py-3">
                        {isBangla ? "স্ট্যাটাস" : "Status"}
                      </th>
                      <th className="px-6 py-3 text-right">
                        {isBangla ? "ব্যালেন্স" : "Balance"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-transparent">
                    {ledgerEntries.map((entry: any) => {
                      return (
                        <tr
                          key={entry.id}
                          className="hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedTransaction(entry)}
                        >
                          <td className="px-6 py-4 font-semibold text-foreground max-w-[180px] truncate text-xs">
                            {entry.description}
                          </td>
                          <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(entry.date, "short")}
                          </td>
                          <td className="px-6 py-4 text-right font-medium whitespace-nowrap text-xs">
                            {formatCurrency(Math.abs(entry.amount))}
                          </td>
                          <td className="px-6 py-4 text-right font-medium whitespace-nowrap text-xs">
                            {entry.paidAmount !== undefined && entry.paidAmount !== null ? (
                              formatCurrency(entry.paidAmount)
                            ) : entry.type === "payment" ? (
                              formatCurrency(Math.abs(entry.amount))
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusContent(entry)}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-foreground whitespace-nowrap text-xs">
                            {formatCurrency(entry.balance)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-6 pb-4 bg-muted/5">
                <PaginationHelper
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  isBangla={isBangla}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <AddPaymentInModal
        isOpen={showPaymentInModal}
        onClose={() => setShowPaymentInModal(false)}
        defaultPartyId={party.id}
      />

      <AddPaymentOutModal
        isOpen={showPaymentOutModal}
        onClose={() => setShowPaymentOutModal(false)}
        defaultPartyId={party.id}
      />

      <AdjustBalanceModal
        isOpen={showAdjustBalanceModal}
        onClose={() => setShowAdjustBalanceModal(false)}
        partyId={party.id}
        partyName={party.name}
        currentBalance={party.currentBalance}
      />

      <AddReminderModal
        isOpen={showAddReminderModal}
        onClose={() => setShowAddReminderModal(false)}
        partyId={party.id}
        initialTitle={
          isReceivable
            ? `Collect Tk. ${Math.abs(party.currentBalance).toLocaleString()} from ${party.name}`
            : `Pay Tk. ${Math.abs(party.currentBalance).toLocaleString()} to ${party.name}`
        }
      />

      {selectedTransaction && selectedTransaction.type === "sale" && (
        <SaleDetailsModal
          isOpen={selectedTransaction !== null}
          onClose={() => setSelectedTransaction(null)}
          saleId = {selectedTransaction.referenceId }
        />
      )}

      {selectedTransaction && (selectedTransaction.type === "purchase" || selectedTransaction.referenceType === "purchase") && (
        <PurchaseDetailsModal
          isOpen={selectedTransaction !== null}
          onClose={() => setSelectedTransaction(null)}
          purchaseId = {selectedTransaction.referenceId }
        />
      )}
  
      {selectedTransaction && (
        selectedTransaction.type === "payment" 
      ) && (
        <PaymentDetailsModal
          isOpen={selectedTransaction !== null}
          onClose={() => setSelectedTransaction(null)}
          paymentId = {selectedTransaction?.referenceId}
        />
      )}

      {selectedTransaction && selectedTransaction.type === "adjustment" && (
        <AdjustmentDetailsModal
          isOpen={selectedTransaction !== null}
          onClose={() => setSelectedTransaction(null)}
          id={selectedTransaction?.id}
          party={party}
        />
      )}

      {selectedTransaction && selectedTransaction.type === "opening" && (
        <OpeningBalanceDetailsModal
          isOpen={selectedTransaction !== null}
          onClose={() => setSelectedTransaction(null)}
          entry={selectedTransaction}
          party={party}
        />
      )}
      {/* Edit Party Modal */}
      <EditPartyModal
        isOpen={showEditPartyModal}
        onClose={() => setShowEditPartyModal(false)}
        partyId={partyId}
      />
    </div>
  );
}

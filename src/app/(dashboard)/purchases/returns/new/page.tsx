// Hello Khata OS - Purchase Return Page
// হ্যালো খাতা - নতুন ক্রয় ফেরত পেজ

"use client";

import  { useState, useMemo, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Banknote,
  CreditCard,
  Smartphone,
  Trash2,
  Calendar as CalendarIcon,
  X,
  ArrowLeft,
  Loader2,
  RotateCcw,
  Search,
  Sparkles,
  CheckCircle,
  Receipt,
  Upload,
} from "lucide-react";
import { useCurrency, useAppTranslation } from "@/hooks/useAppTranslation";
import { useUser } from "@/stores/sessionStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useReturnPurchase } from "@/hooks/api/useReturns";
import { useGetPurchases, useGetPurchaseById } from "@/hooks/api/usePurchases";
import { useGetPaymentMethods } from "@/hooks/api/usePaymentMethod";
import { useParty } from "@/hooks/api/useParties";

interface PaymentRow {
  id: string;
  method: "cash" | "bank" | "mobile_banking";
  accountId: string;
  reference: string;
  transactionId: string;
  amount: number;
  date: Date;
}

const METHODS = [
  { id: "cash", label: "Cash", icon: Banknote, accent: "var(--emerald-500)", colorClass: "text-emerald-500", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/20" },
  { id: "bank", label: "Bank/Card", icon: CreditCard, accent: "var(--blue-500)", colorClass: "text-blue-500", bgClass: "bg-blue-500/10", borderClass: "border-blue-500/20" },
  { id: "mobile_banking", label: "Mobile Banking", icon: Smartphone, accent: "var(--orange-500)", colorClass: "text-orange-500", bgClass: "bg-orange-500/10", borderClass: "border-orange-500/20" },
];

interface ReturnItemRow {
  id: string;
  purchaseItemId?: string;
  itemId: string;
  itemName: string;
  sku: string;
  batchNo?: string;
  batchId?: string;
  quantity: number;
  maxQuantity: number;
  remainingQuantity: number;
  unitCost: number;
  taxPercent?: number;
  unit: string;
  returnType: "refund" | "replacement" | "exchange" | "damage" | "expired" | "warranty" | "supplier_credit";
  reason: string;
  total: number;
  searchQuery: string;
  showSuggestions: boolean;
  imageUrl?: string;
  isSelected?: boolean;
}

function NewPurchaseReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supplierIdParam = searchParams.get("supplierId") || "";
  const purchaseIdParam = searchParams.get("purchaseId") || "";

    // purchased items
  const [purchase,setPurchase] = useState<any>(null);

  // Return items table state
  const [purchasedItems, setPurchasedItems] = useState<ReturnItemRow[]>([]);
  const { isBangla } = useAppTranslation();
  const { formatCurrency } = useCurrency();
  const { mutate: returnPurchase, isPending: isSubmitting } = useReturnPurchase();
  const user = useUser();

  // Queries
  // const { data: branches = [] } = useBranches();
  
  // Selected Purchase & Supplier state
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(supplierIdParam);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string>(purchaseIdParam);

  // Search queries for supplier, invoice, product search
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState("");
  const [showInvoiceSuggestions, setShowInvoiceSuggestions] = useState(false);

  const { data: singleSupplierData } = useParty(selectedSupplierId, {
    enabled: !!selectedSupplierId,
  });

  const { data: purchaseData = [] } = useGetPurchases({ search: invoiceSearchQuery });
  const { data: singlePurchaseData, isLoading: isPurchaseLoading } = useGetPurchaseById(selectedPurchaseId);

  // Sync purchaseIdParam if search params change
  useEffect(() => {
    if (purchaseIdParam && purchaseIdParam !== selectedPurchaseId) {
      setSelectedPurchaseId(purchaseIdParam);
    }
  }, [purchaseIdParam]);

  // Set purchase state when singlePurchaseData is fetched
  useEffect(() => {
    if (singlePurchaseData) {
      setPurchase(singlePurchaseData);
      setSelectedSupplierId(singlePurchaseData.supplierId || singlePurchaseData.supplier?.id || "");
      setInvoiceSearchQuery(singlePurchaseData.grnNo || singlePurchaseData.invoiceNo || "");
    }
  }, [singlePurchaseData]);
 
  useEffect(() => {
    if (!purchase) {
      setPurchasedItems([]);
      return;
    }

    const items = purchase.items || purchase.purchaseItems || [];
    const initialItems: ReturnItemRow[] = items.map((item: any) => ({
      id: item?.id,
      purchaseItemId: item?.id,
      itemId: item?.productId || item?.itemId || item?.item?.id || item?.id,
      itemName: item?.itemName || item?.item?.name || item?.name || "",
      sku: item?.sku || item?.item?.sku || "—",
      batchNo: item?.batchNo || item?.batchNumber || item?.batch?.batchNo || "",
      batchId: item?.batchId || item?.batchNo || item?.batch?.id || undefined,
      quantity: item?.remainingQuantity ?? item?.quantity ?? 1,
      maxQuantity: item?.quantity ?? item?.remainingQuantity ?? 1,
      remainingQuantity: item?.remainingQuantity ?? item?.quantity ?? 1,
      unitCost: item?.unitCost ?? item?.rate ?? 0,
      taxPercent: item?.taxPercent ?? item?.taxRate ?? item?.tax ?? 0,
      unit: typeof item?.unit === "object"
        ? item?.unit?.symbol || item?.unit?.name || "pcs"
        : typeof item?.item?.unit === "object"
        ? item?.item?.unit?.symbol || item?.item?.unit?.name || "pcs"
        : item?.unit || item?.item?.unit || "pcs",
      returnType: "refund",
      reason: "damaged",
      total: (item?.remainingQuantity ?? item?.quantity ?? 1) * (item?.unitCost ?? item?.rate ?? 0),
      searchQuery: "",
      showSuggestions: false,
      imageUrl: item?.imageUrl || item?.item?.imageUrl || "",
      isSelected: false,
    }));
    setPurchasedItems(initialItems);
  }, [purchase]);

  const [returnNo, setReturnNo] = useState("");

  const [returnDate, setReturnDate] = useState<Date>(new Date());
  const [responsiblePerson, setResponsiblePerson] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [returnStatus, setReturnStatus] = useState<"draft" | "pending" | "approved" | "completed" | "cancelled">("completed");

  const { data: paymentMethods = [] } = useGetPaymentMethods();
  const accounts = useMemo(() => {
    return paymentMethods.map((pm: any) => ({
      id: pm.id,
      name: pm.name || pm.bankName || pm.provider || '',
      balance: pm.currentBalance || pm.openingBalance || 0,
      type: pm.type
    }));
  }, [paymentMethods]);

  // Adjustments & Split Refund Configurations
  const [shippingAdjustment, setShippingAdjustment] = useState<number>(0);
  const [additionalCharges, setAdditionalCharges] = useState<number>(0);

  // Payment/Refund states
  const [payments, setPayments] = useState<PaymentRow[]>([
    {
      id: "pay-initial",
      method: "cash",
      accountId: "",
      reference: "",
      transactionId: "",
      amount: 0,
      date: new Date(),
    },
  ]);
  const [splitMode, setSplitMode] = useState(false);
  const [activeSplitMethod, setActiveSplitMethod] = useState<string>("cash");

  const [attachments, setAttachments] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [invoiceImage, setInvoiceImage] = useState<File | null>(null);
  const [invoiceImagePreview, setInvoiceImagePreview] = useState<string | null>(null);

  const handleInvoiceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInvoiceImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvoiceImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveInvoiceImage = () => {
    setInvoiceImage(null);
    setInvoiceImagePreview(null);
  };

  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

  // Financial calculations
  const subtotal = useMemo(() => {
    return purchasedItems?.reduce((sum, item) => sum + (item?.isSelected ? item?.quantity * item?.unitCost : 0), 0);
  }, [purchasedItems]);

  const taxAmount = useMemo(() => {
    return purchasedItems?.reduce((sum, item) => {
      if (!item?.isSelected) return sum;
      const itemTotal = item?.quantity * item?.unitCost;
      return sum + (itemTotal * ((item?.taxPercent || 0) / 100));
    }, 0);
  }, [purchasedItems]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal + taxAmount + shippingAdjustment + additionalCharges);
  }, [subtotal, taxAmount, shippingAdjustment, additionalCharges]);

  const totalPaid = useMemo(() => {
    return payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [payments]);

  const due = useMemo(() => {
    return Math.max(0, grandTotal - totalPaid);
  }, [grandTotal, totalPaid]);

  const changeReturned = useMemo(() => {
    return Math.max(0, totalPaid - grandTotal);
  }, [totalPaid, grandTotal]);

  const toggleSplitMode = () => {
    if (splitMode) {
      // Revert to single payment mode
      setPayments([
        {
          id: Math.random().toString(),
          method: "cash",
          accountId: "",
          reference: "",
          transactionId: "",
          amount: grandTotal,
          date: new Date(),
        },
      ]);
    } else {
      setActiveSplitMethod("cash");
      // Enter split mode
      setPayments([
        {
          id: "cash-split",
          method: "cash",
          accountId: "",
          reference: "",
          transactionId: "",
          amount: grandTotal,
          date: new Date(),
        },
        {
          id: "bank-split",
          method: "bank",
          accountId: "",
          reference: "",
          transactionId: "",
          amount: 0,
          date: new Date(),
        },
        {
          id: "mobile-split",
          method: "mobile_banking",
          accountId: "",
          reference: "",
          transactionId: "",
          amount: 0,
          date: new Date(),
        }
      ]);
    }
    setSplitMode(!splitMode);
  };

  const handlePaymentFieldChange = (id: string, field: keyof PaymentRow, value: any) => {
    setPayments((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            [field]: value,
          };
        }
        return p;
      })
    );
  };

  const updateQuantity = (id: string, quantity: number) => {
    setPurchasedItems((prev) =>
      prev.map((item) => {
        if (item?.id === id) {
          const maxAllowed = item?.maxQuantity ?? item?.remainingQuantity ?? 0;
          const newQty = Math.min(Math.max(0, quantity), maxAllowed);
          return {
            ...item,
            quantity: newQty,
            total: newQty * item?.unitCost,
          };
        }
        return item;
      }),
    );
  };

  const updateItemField = (id: string, field: keyof ReturnItemRow, value: any) => {
    setPurchasedItems((prev) =>
      prev.map((item) => {
        if (item?.id === id) {
          return {
            ...item,
            [field]: value,
          };
        }
        return item;
      }),
    );
  };

  // Submit flow
  const handleSubmitWithStatus = (status: typeof returnStatus, andThen: "redirect" | "clear" | "print") => {
    const itemsToReturn = purchasedItems.filter((i) => i.isSelected && (i.itemId !== "" || i.itemName !== "") && i.quantity > 0);

    const supplierId = selectedSupplierId || purchase?.supplierId || purchase?.supplier?.id || "";
    const purchaseId = selectedPurchaseId || purchase?.id || "";

    if (!supplierId) {
      toast.error(isBangla ? "সরবরাহকারী নির্বাচন করা নেই" : "No supplier selected");
      return;
    }
    if (itemsToReturn.length === 0) {
      toast.error(isBangla ? "অন্তত একটি পণ্য ফেরত দিন" : "Select at least one item to return");
      return;
    }

    const payload = {
      purchaseId: purchaseId || undefined,
      supplierId: supplierId,
      returnDate: format(returnDate, "yyyy-MM-dd"),
      items: itemsToReturn.map((item) => ({
        purchaseItemId: item?.purchaseItemId || item?.id,
        itemId: item?.itemId,
        itemName: item?.itemName,
        batchId: item?.batchId || item?.batchNo || undefined,
        quantity: Number(item?.quantity) || 0,
        returnType: item?.returnType || "refund",
        reason: item?.reason || "damaged",
      })),
      refundMethod: (splitMode ? payments.find(p => p.amount > 0)?.method : payments[0]?.method) || "cash",
      accountId: (splitMode ? payments.find(p => p.amount > 0)?.accountId : payments[0]?.accountId) || undefined,
      notes: notes || undefined,
    };

    returnPurchase(payload, {
      onSuccess: () => {
        toast.success(
          isBangla ? "ক্রয় ফেরত সফলভাবে সম্পন্ন হয়েছে" : "Purchase return saved successfully",
        );
        if (andThen === "clear") {
          setPurchasedItems([]);
          setNotes("");
          setReferenceNo("");
        } else if (andThen === "print") {
          window.print();
          router.push("/purchases/returns");
        } else {
          router.push("/purchases/returns");
        }
      },
      onError: (err: any) => {
        toast.error(
          err?.response?.data?.message || (isBangla ? "ক্রয় ফেরত সংরক্ষণ করতে সমস্যা হয়েছে" : "Failed to save purchase return"),
        );
      },
    });
  };

  const returnTypes = [
    { value: "refund", label: isBangla ? "রিফান্ড (Refund)" : "Refund" },
    { value: "replacement", label: isBangla ? "প্রতিস্থাপন (Replacement)" : "Replacement" },
    { value: "exchange", label: isBangla ? "বিনিময় (Exchange)" : "Exchange" },
    { value: "warranty", label: isBangla ? "ওয়ারেন্টি (Warranty)" : "Warranty" }
  ];

  const returnReasons = [
    { value: "damaged", label: isBangla ? "ক্ষতিগ্রস্ত (Damaged)" : "Damaged" },
    { value: "expired", label: isBangla ? "মেয়াদোত্তীর্ণ (Expired)" : "Expired" },
    { value: "wrong_product", label: isBangla ? "ভুল পণ্য (Wrong Product)" : "Wrong Product" },
    { value: "wrong_quantity", label: isBangla ? "ভুল পরিমাণ (Wrong Quantity)" : "Wrong Quantity" },
    { value: "defective", label: isBangla ? "ত্রুটিপূর্ণ (Defective)" : "Defective" }
  ];

  return (
    <div className="space-y-6">
      {/* Header section - Exactly matching New Purchase UI */}
      <div className="flex items-center justify-between pb-3 border-b border-border/80">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <RotateCcw className="h-6 w-6 text-primary" />
            {isBangla ? "ক্রয় ফেরত" : "Purchase Return"}
          </h1>
        </div>
      </div>

      {/* Main Purchase Invoice Card */}
      <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm space-y-4">
        {/* Card Header & Invoice Change Button */}
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Receipt className="h-4 w-4" />
            <span>{isBangla ? "ক্রয় ইনভয়েস" : "Purchase Invoice"}</span>
          </div>
        </div>

        {/* 4-Column Grid: Purchase Invoice, Supplier(disable), Purchase Date(disable), Return Date */}
        <div className={cn("grid grid-cols-1 gap-4 items-end", purchase ? "md:grid-cols-2 lg:grid-cols-4" : "")}>
          {/* Field 1 (25%): Purchase Invoice */}
          <div className="relative space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              {isBangla ? "ক্রয় ইনভয়েস" : "Purchase Invoice"}
            </Label>
            <div className="relative">
              <Input
                value={invoiceSearchQuery}
                onChange={(e) => {
                  setInvoiceSearchQuery(e.target.value);
                  // if (selectedPurchaseId) setSelectedPurchaseId("");
                  setShowInvoiceSuggestions(true);
                }}
                onFocus={() => setShowInvoiceSuggestions(true)}
                onBlur={() => {
                  setShowInvoiceSuggestions(false)
                }}
                placeholder={
                  isBangla
                    ? "ইনভয়েস নম্বর দিয়ে খুঁজুন..."
                    : "Search purchase invoice number..."
                }
                className="pr-10 h-11 bg-background/50 border-input focus-visible:ring-1 text-sm font-medium w-full"
              />
              {isPurchaseLoading ? (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
              ) : (
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              )}

              {showInvoiceSuggestions && (
                <div className="absolute z-50 left-0 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto divide-y divide-border">
                  {purchaseData.length === 0 ? (
                    <div className="p-3 text-center text-sm text-muted-foreground">
                      {isBangla
                        ? "কোনো ইনভয়েস পাওয়া যায়নি"
                        : "No invoices found"}
                    </div>
                  ) : (
                    purchaseData.map((purchase: any) => (
                      <button
                        key={purchase.id}
                        type="button"
                        className="w-full text-left p-3 hover:bg-muted/80 text-sm transition-colors flex justify-between items-center"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setPurchase(purchase);
                          setSelectedPurchaseId(purchase.id);
                          setSelectedSupplierId(purchase.supplierId || purchase.supplier?.id || "");
                          setInvoiceSearchQuery(purchase.grnNo || purchase.invoiceNo || "");
                          setShowInvoiceSuggestions(false);
                        }}

                        onClick={() => {
                          setPurchase(purchase);
                          setSelectedPurchaseId(purchase.id);
                          setSelectedSupplierId(purchase.supplierId || purchase.supplier?.id || "");
                          setInvoiceSearchQuery(purchase.grnNo || purchase.invoiceNo || "");
                        }}
                      >
                        <div>
                          <p className="font-semibold text-foreground">
                            {purchase.grnNo || ''}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {purchase.supplier?.name || "Supplier"}
                          </p>
                        </div>
                        <span className="font-bold text-xs text-primary">
                          {formatCurrency(purchase.total)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {!!purchase && (
            <>
              {/* Field 2 (25%): Supplier (Non-editable) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  {isBangla ? "সরবরাহকারী" : "Supplier"}
                </Label>
                <Input
                  readOnly
                  disabled
                  value={
                    purchase?.supplier?.name || purchase?.supplierName || purchase?.party?.name || purchase?.name || "—"
                  }
                  placeholder={isBangla ? "ইনভয়েস নির্বাচন করুন" : "Select invoice"}
                  className="h-11 bg-muted/40 border-input text-sm font-bold text-foreground cursor-not-allowed disabled:opacity-80"
                />
              </div>

              {/* Field 3 (25%): Purchase Date (Non-editable) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  {isBangla ? "ক্রয় তারিখ" : "Purchase Date"}
                </Label>
                <Input
                  readOnly
                  disabled
                  value={
                    purchase?.purchaseDate && !isNaN(new Date(purchase.purchaseDate).getTime())
                      ? format(new Date(purchase.purchaseDate), "dd MMM yyyy")
                      : purchase?.createdAt && !isNaN(new Date(purchase.createdAt).getTime())
                      ? format(new Date(purchase.createdAt), "dd MMM yyyy")
                      : ""
                  }
                  placeholder={isBangla ? "ইনভয়েস নির্বাচন করুন" : "Select invoice"}
                  className="h-11 bg-muted/40 border-input text-sm font-semibold text-foreground cursor-not-allowed disabled:opacity-80"
                />
              </div>

              {/* Field 4 (25%): Return Date (Editable Date Picker) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  {isBangla ? "ফেরতের তারিখ" : "Return Date"}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-11 justify-between text-left font-normal bg-background/50 border-input text-foreground hover:bg-muted text-sm font-medium cursor-pointer"
                    >
                      <span>{format(returnDate, "dd MMM yyyy")}</span>
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={returnDate}
                      onSelect={(date) => date && setReturnDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}
        </div>
      </div>

      {/* IF NO INVOICE IS SELECTED: SHOW EMPTY PLACEHOLDER CARD */}
      {!purchase ? (
        <div className="bg-card/50 border border-dashed border-border rounded-xl p-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            {isPurchaseLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Receipt className="h-6 w-6" />
            )}
          </div>
          <h3 className="text-base font-semibold text-foreground">
            {isPurchaseLoading
              ? isBangla
                ? "ক্রয় তথ্য লোড হচ্ছে..."
                : "Loading Purchase Invoice..."
              : isBangla
              ? "কোনো ক্রয় ইনভয়েস নির্বাচন করা হয়নি"
              : "No Purchase Invoice Selected"}
          </h3>
          <p className="text-xs text-muted-foreground mx-auto">
            {isPurchaseLoading
              ? isBangla
                ? "অনুগ্রহ করে অপেক্ষা করুন, ক্রয়ের বিবরণ সংগ্রহ করা হচ্ছে।"
                : "Please wait while fetching the purchase invoice details."
              : isBangla
              ? "ক্রয় ফেরত প্রক্রিয়া শুরু করতে উপরে যেকোনো মূল ক্রয় ইনভয়েস সার্চ করে সিলেক্ট করুন।"
              : "Please search and select an original purchase invoice above to view purchase details, product info, and process return items."}
          </p>
        </div>
      ) : (
        /* Main 12-column grid layout (Shown when invoice is selected) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Section (Spans 9 columns on desktop) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Section 3: Return Items List Table */}
          <div className="bg-zinc-900/20 border border-border rounded-xl overflow-hidden shadow-xs space-y-4">
            {/* Purchase Billing Info Text in sm text at the top of table */}
            {purchase && (
              <div className="px-4 py-2.5 bg-muted/40 border-b border-border/50 flex flex-wrap items-center justify-between gap-3 text-xs font-medium">
                <div className="flex items-center gap-2 flex-wrap text-muted-foreground text-xs">
                  <span className="font-bold text-foreground">
                    {isBangla ? "ক্রয় ইনভয়েস তথ্য:" : "Purchase Billing Info:"}
                  </span>
                </div>

                <div className="flex items-center gap-3.5 flex-wrap text-xs">
                  <span>
                    {isBangla ? "মোট ইনভয়েস:" : "Total:"}{" "}
                    <strong className="font-bold text-foreground">
                      {formatCurrency(purchase.total || 0)}
                    </strong>
                  </span>
                  <span>
                    {isBangla ? "পরিশোধিত:" : "Paid:"}{" "}
                    <strong className="font-bold text-emerald-500">
                      {formatCurrency(
                        purchase.paidAmount ||  0
                      )}
                    </strong>
                  </span>
                  <span>
                    {isBangla ? "বাকি:" : "Due:"}{" "}
                    <strong className="font-bold text-rose-500">
                      {formatCurrency(
                        purchase?.dueAmount || 0
                      )}
                    </strong>
                  </span>
                </div>
              </div>
            )}

            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                {isBangla ? "ফেরতযোগ্য পণ্য তালিকা" : "Returnable Items Details"}
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border/80 bg-muted/20 text-muted-foreground font-semibold">
                    <th className="px-4 py-3">{isBangla ? "আইটেম বিবরণ" : "Item & SKU"}</th>
                    <th className="px-3 py-3 text-right">{isBangla ? "মূল্য" : "Purchase Price"}</th>
                    <th className="px-3 py-3 text-center">{isBangla ? "ট্যাক্স (%)" : "Tax (%)"}</th>
                    <th className="px-3 py-3 text-center">{isBangla ? "ক্রয় পরিমাণ" : "Purchase Qty"}</th>
                    <th className="px-4 py-3 text-center w-28">{isBangla ? "ফেরত পরিমাণ *" : "Return Qty *"}</th>
                    <th className="px-3 py-3">{isBangla ? "ফেরত টাইপ" : "Return Type"}</th>
                    <th className="px-3 py-3">{isBangla ? "কারণ" : "Reason"}</th>
                    <th className="px-3 py-3 text-right">{isBangla ? "মোট" : "Total"}</th>
                    <th className="px-4 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
            
                  {purchasedItems?.map((item) => (
                    <tr 
                      key={item?.id} 
                      className={cn(
                        "hover:bg-muted/20 transition-colors cursor-pointer",
                        item?.isSelected ? "bg-primary/5" : ""
                      )}
                      onClick={() => updateItemField(item?.id, "isSelected", !item?.isSelected)}
                    >
                      <td className="px-4 py-3.5 align-middle">
                        <p className="font-semibold text-foreground text-xs leading-tight">{item?.itemName || (isBangla ? "পণ্য নির্বাচন করুন" : "Select Product")}</p>
                        <p className="text-[10px] text-muted-foreground">SKU: {item?.sku}</p>
                      </td>
                      <td className="px-3 py-3.5 align-middle text-right font-medium text-foreground">
                        {formatCurrency(item?.unitCost)}
                      </td>
                      <td className="px-3 py-3.5 align-middle text-center text-muted-foreground font-semibold">
                        {item?.taxPercent || 0}%
                      </td>
                      <td className="px-3 py-3.5 align-middle text-center text-muted-foreground font-medium">
                        {item?.maxQuantity} {item?.unit}
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center border border-input rounded bg-background/50 h-8 w-24 mx-auto" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            disabled={(item?.quantity || 0) <= 0}
                            onClick={() => updateQuantity(item?.id, (item?.quantity || 0) - 1)}
                            className="h-full px-2 text-muted-foreground hover:text-foreground active:bg-muted/20 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={0}
                            max={item?.maxQuantity}
                            value={item?.quantity || 0}
                            onChange={(e) => updateQuantity(item?.id, parseInt(e.target.value) || 0)}
                            className="w-full text-center h-full bg-transparent outline-none border-none text-xs font-semibold text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            disabled={(item?.quantity || 0) >= (item?.maxQuantity || 0)}
                            onClick={() => updateQuantity(item?.id, (item?.quantity || 0) + 1)}
                            className="h-full px-2 text-muted-foreground hover:text-foreground active:bg-muted/20 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 align-middle">
                        <div onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={item?.returnType}
                            onValueChange={(val: any) => updateItemField(item?.id, "returnType", val)}
                          >
                            <SelectTrigger className="h-8 text-[11px] bg-background/40 w-28 border-input">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {returnTypes.map((t) => (
                                <SelectItem key={t.value} value={t.value} className="text-xs">
                                  {t.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 align-middle">
                        <div onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={item?.reason}
                            onValueChange={(val: any) => updateItemField(item?.id, "reason", val)}
                          >
                            <SelectTrigger className="h-8 text-[11px] bg-background/40 w-28 border-input">
                              <SelectValue placeholder={isBangla ? "কারণ বলুন" : "Reason"} />
                            </SelectTrigger>
                            <SelectContent>
                              {returnReasons.map((r) => (
                                <SelectItem key={r.value} value={r.value} className="text-xs">
                                  {r.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 align-middle text-right font-bold text-foreground">
                        {formatCurrency(item?.quantity * item?.unitCost)}
                      </td>
                      <td className="px-4 py-3.5 align-middle text-right">
                        <div onClick={(e) => e.stopPropagation()} className="inline-flex items-center justify-center">
                          <Checkbox
                            checked={item?.isSelected}
                            onCheckedChange={(checked) => updateItemField(item?.id, "isSelected", !!checked)}
                            className="h-[18px] w-[18px] border-2 border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom summary bar */}
            <div className="flex justify-end items-center px-5 py-3.5 bg-muted/10 border-t border-border">
             
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground font-semibold text-xs">
                  {isBangla ? "আইটেম উপমোট পরিমাণ" : "Return Subtotal Amount"}
                </span>
                <span className="font-bold text-foreground text-sm">
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes & Invoice Image Upload Card */}
          <div className="bg-zinc-900/20 border border-border rounded-xl p-5 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Remarks/Notes */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {isBangla ? "মন্তব্য বা বিশেষ নির্দেশনা" : "Remarks or Special Notes"}
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    isBangla
                      ? "অতিরিক্ত বিবরণ লিখুন..."
                      : "Enter additional purchase remarks..."
                  }
                  className="h-32 bg-background/50 border-input resize-none text-xs"
                />
              </div>

              {/* Invoice Image Upload */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {isBangla ? "ইনভয়েস বা রসিদের ছবি" : "Invoice / Receipt Image"}
                </Label>
                {invoiceImagePreview ? (
                  <div className="relative h-32 w-full rounded-lg border border-border bg-background/50 overflow-hidden flex items-center justify-center group">
                    <img
                      src={invoiceImagePreview}
                      alt="Invoice preview"
                      className="h-full w-full object-contain p-1"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleRemoveInvoiceImage}
                        className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-colors cursor-pointer shadow-xs"
                        title={isBangla ? "মুছে ফেলুন" : "Remove Image"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="h-32 w-full rounded-lg border-2 border-dashed border-input hover:border-primary/60 bg-background/30 hover:bg-background/50 flex flex-col items-center justify-center cursor-pointer transition-colors p-4 text-center">
                    <Upload className="h-6 w-6 text-muted-foreground mb-1.5" />
                    <span className="text-xs font-semibold text-foreground">
                      {isBangla ? "ইনভয়েস ছবি আপলোড করুন" : "Upload Invoice Image"}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      PNG, JPG, WEBP ({isBangla ? "সর্বোচ্চ ৫ মেগাবাইট" : "Max 5MB"})
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleInvoiceImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Refund Summary sticky card (3 columns on desktop) */}
        <div className="lg:col-span-3 lg:sticky lg:top-6 space-y-6">
          <div className="bg-zinc-900/20 border border-border rounded-xl p-5 space-y-4 shadow-xs">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
              {isBangla ? "ফেরত বিবরণী" : "Refund Summary"}
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>{isBangla ? "আইটেম উপমোট" : "Item Subtotal"}</span>
                <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
              </div>

              {/* Calculated Tax */}
              <div className="flex justify-between items-center text-muted-foreground pt-1.5 border-t border-border/40">
                <span>{isBangla ? "ট্যাক্স" : "Tax"}</span>
                <span className="font-semibold text-foreground">{formatCurrency(taxAmount)}</span>
              </div>

              {/* Additional Cost */}
              <div className="flex justify-between items-center text-muted-foreground">
                <span>{isBangla ? "অতিরিক্ত খরচ" : "Additional Cost"}</span>
                <div className="relative w-28 flex items-center">
                  <span className="absolute left-2 text-[10px] font-medium text-muted-foreground">Tk.</span>
                  <Input
                    type="number"
                    value={additionalCharges || ""}
                    onChange={(e) => setAdditionalCharges(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="h-8 text-right pl-6 bg-background/40 text-xs text-foreground font-semibold"
                    min="0"
                  />
                </div>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-center border-t border-border pt-3 text-sm font-bold">
                <span className="text-foreground">{isBangla ? "সর্বমোট ফেরতযোগ্য" : "Grand Total"}</span>
                <span className="text-primary text-base">{formatCurrency(grandTotal)}</span>
              </div>

              {/* Refund Info Section */}
              <div>
                <div className="flex items-center justify-end gap-2 border-b border-border pb-2.5">
                  <div className="flex items-center gap-2 group">
                    <Label htmlFor="split-mode" className="text-muted-foreground text-xs cursor-pointer">
                      {isBangla ? "একাধিক পদ্ধতি ব্যবহার করুন" : "Split across multiple methods"}
                    </Label>
                    <Switch
                      id="split-mode"
                      checked={splitMode}
                      onCheckedChange={toggleSplitMode}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  {(() => {
                    const activePayment = splitMode
                      ? payments.find(p => p.method === activeSplitMethod) || payments[0]
                      : payments[0];
                    
                    if (!activePayment) return null;
                    const p = activePayment;

                    return (
                      <div key={p.id} className="bg-background/30 p-4 border border-border/60 rounded-xl transition-colors">
                        {/* Method chips */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          {METHODS.map((m) => {
                            const Icon = m.icon;
                            const active = splitMode ? activeSplitMethod === m.id : p.method === m.id;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  if (splitMode) {
                                    setActiveSplitMethod(m.id);
                                  } else {
                                    handlePaymentFieldChange(p.id, "method", m.id);
                                  }
                                }}
                                className={cn(
                                  "flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all cursor-pointer",
                                  active ? cn(m.bgClass, m.borderClass) : "border-border/60 bg-transparent hover:bg-muted/30"
                                )}
                              >
                                <Icon size={18} className={active ? m.colorClass : "text-muted-foreground"} strokeWidth={2} />
                                <span
                                  className={cn(
                                    "text-[10px] font-medium leading-tight text-center",
                                    active ? m.colorClass : "text-muted-foreground"
                                  )}
                                >
                                  {m.label}
                                  {splitMode && (() => {
                                    const splitP = payments.find(pay => pay.method === m.id);
                                    return splitP && splitP.amount > 0 ? (
                                      <span className="block mt-0.5 font-bold text-foreground text-[11px]">
                                        Tk.{splitP.amount}
                                      </span>
                                    ) : null;
                                  })()}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Common Amount Input */}
                        {!["cash", "bank", "mobile_banking"].includes(p.method) && (
                          <div className="mb-3">
                            <div className="flex items-center bg-background/50 rounded-xl border border-border/60 px-3.5 py-2 focus-within:border-primary">
                              <span className="text-muted-foreground text-sm mr-1.5">{"\u09F3"}</span>
                              <input
                                type="number"
                                value={p.amount || ""}
                                onChange={(e) => handlePaymentFieldChange(p.id, "amount", parseFloat(e.target.value) || 0)}
                                className="bg-transparent text-foreground text-sm font-mono outline-none w-full"
                                placeholder={isBangla ? "পরিমাণ" : "Amount"}
                              />
                            </div>
                          </div>
                        )}

                        {/* Fields for Cash */}
                        {p.method === "cash" && (
                          <div className="mb-3">
                            <div className="flex items-center bg-background/50 rounded-xl border border-border/60 px-3.5 py-2 focus-within:border-primary">
                              <span className="text-muted-foreground text-sm mr-1.5">{"\u09F3"}</span>
                              <input
                                type="number"
                                value={p.amount || ""}
                                onChange={(e) => handlePaymentFieldChange(p.id, "amount", parseFloat(e.target.value) || 0)}
                                className="bg-transparent text-foreground text-sm font-mono outline-none w-full"
                                placeholder={isBangla ? "পরিমাণ" : "Amount"}
                              />
                            </div>
                          </div>
                        )}

                        {/* Fields for Bank */}
                        {p.method === "bank" && (
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="flex items-center bg-background/50 rounded-xl border border-border/60 px-3.5 py-2 focus-within:border-primary">
                              <span className="text-muted-foreground text-sm mr-1.5">{"\u09F3"}</span>
                              <input
                                type="number"
                                value={p.amount || ""}
                                onChange={(e) => handlePaymentFieldChange(p.id, "amount", parseFloat(e.target.value) || 0)}
                                className="bg-transparent text-foreground text-sm font-mono outline-none w-full"
                                placeholder={isBangla ? "পরিমাণ" : "Amount"}
                              />
                            </div>
                            <Select
                              value={p.accountId}
                              onValueChange={(val) => handlePaymentFieldChange(p.id, "accountId", val)}
                            >
                              <SelectTrigger className="h-10 text-xs bg-background/50 border-input w-full rounded-xl">
                                <SelectValue placeholder={isBangla ? "অ্যাকাউন্ট নির্বাচন করুন" : "Select Account"} />
                              </SelectTrigger>
                              <SelectContent>
                                {accounts.filter((a: any) => a.type === 'bank').map((acc: any) => (
                                  <SelectItem key={acc.id} value={acc.id}>
                                    {acc.name}  
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Fields for Mobile Banking */}
                        {p.method === "mobile_banking" && (
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <Select
                              value={p.accountId}
                              onValueChange={(val) => handlePaymentFieldChange(p.id, "accountId", val)}
                            >
                              <SelectTrigger className="h-10 text-xs bg-background/50 border-input w-full rounded-xl">
                                <SelectValue placeholder={isBangla ? "অ্যাকাউন্ট নির্বাচন করুন" : "Select Account"} />
                              </SelectTrigger>
                              <SelectContent>
                                {accounts.filter((a: any) => a.type === 'mobile_banking').map((acc: any) => (
                                  <SelectItem key={acc.id} value={acc.id}>
                                    {acc.name} (Tk.{acc.balance})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex items-center bg-background/50 rounded-xl border border-border/60 px-3.5 py-2 focus-within:border-primary h-10">
                              <span className="text-muted-foreground text-sm mr-1.5">{"\u09F3"}</span>
                              <input
                                type="number"
                                value={p.amount || ""}
                                onChange={(e) => handlePaymentFieldChange(p.id, "amount", parseFloat(e.target.value) || 0)}
                                className="bg-transparent text-foreground text-sm font-mono outline-none w-full"
                                placeholder={isBangla ? "পরিমাণ" : "Amount"}
                              />
                            </div>
                            <input
                              type="text"
                              value={p.transactionId}
                              onChange={(e) => handlePaymentFieldChange(p.id, "transactionId", e.target.value)}
                              placeholder={isBangla ? "লেনদেন আইডি" : "TXN ID (optional)"}
                              className="w-full h-10 bg-background/50 rounded-xl border border-border/60 px-3.5 py-2.5 text-foreground text-xs outline-none placeholder:text-muted-foreground focus:border-primary"
                            />
                            <input
                              type="text"
                              value={p.reference}
                              onChange={(e) => handlePaymentFieldChange(p.id, "reference", e.target.value)}
                              placeholder={isBangla ? "রেফারেন্স" : "Ref no (optional)"}
                              className="w-full h-10 bg-background/50 rounded-xl border border-border/60 px-3.5 py-2.5 text-foreground text-xs outline-none placeholder:text-muted-foreground focus:border-primary"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {splitMode && payments.some(p => p.amount > 0) && (
                <div className="pt-2 pb-1 space-y-1.5">
                  {payments.filter(p => p.amount > 0).map((p) => {
                    const methodLabel = METHODS.find(m => m.id === p.method)?.label || p.method;
                    const accountName = accounts.find((a: any) => String(a.id) === String(p.accountId))?.name;
                    return (
                      <div key={p.id} className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>{methodLabel} {accountName ? `(${accountName})` : ''}</span>
                        <span>{formatCurrency(p.amount)}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-between items-center text-muted-foreground pt-1.5 border-t border-border/40 mt-1.5">
                <span>{isBangla ? "রিফান্ড পরিমাণ" : "Refund Amount"}</span>
                <span className="font-bold text-foreground">{formatCurrency(totalPaid)}</span>
              </div>

              {due > 0 && (
                <div className="flex justify-between items-center text-rose-500 font-bold">
                  <span>{isBangla ? "বাকি পরিমাণ" : "Remaining Amount"}</span>
                  <span>{formatCurrency(due)}</span>
                </div>
              )}

              {changeReturned > 0 && (
                <div className="flex justify-between items-center text-blue-500 font-bold">
                  <span>{isBangla ? "অতিরিক্ত" : "Excess Return"}</span>
                  <span>{formatCurrency(changeReturned)}</span>
                </div>
              )}
            </div>

            {/* Bottom Actions inside Sticky Panel */}
            <div className="space-y-2 pt-3 border-t border-border">
              <Button
                type="button"
                onClick={() => handleSubmitWithStatus(returnStatus, "redirect")}
                disabled={isSubmitting}
                className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-1.5 cursor-pointer text-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>{isBangla ? "সংরক্ষণ হচ্ছে..." : "Saving..."}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>{isBangla ? "সম্পূর্ণ ফেরত দিন" : "Complete Return"}</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                className="w-full h-9 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {isBangla ? "বাতিল করুন" : "Cancel"}
              </Button>
            </div>
          </div>

          {/* AI Suggestions Card */}
          {isAiPanelOpen && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 shadow-xs space-y-3.5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  <span>{isBangla ? "এআই ফেরত বুদ্ধি" : "AI Return Insights"}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsAiPanelOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}

export default function NewPurchaseReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <NewPurchaseReturnContent />
    </Suspense>
  );
}

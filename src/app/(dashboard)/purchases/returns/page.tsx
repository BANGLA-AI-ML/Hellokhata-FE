// Hello Khata OS - Premium Purchase Returns Page
// হ্যালো খাতা - পারচেজ রিটার্ন পেজ

"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  KPICard,
  Divider,
  EmptyState,
} from "@/components/ui/premium";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Eye,
  Printer,
  RotateCcw,
  Receipt,
  Banknote,
  Truck,
  Package,
} from "lucide-react";
import { useCurrency, useDateFormat } from "@/hooks/useAppTranslation";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGetPurchaseReturns } from "@/hooks/api/useReturns";

export default function PurchaseReturnsPage() {
  const { isBangla } = useAppTranslation();
  const { formatCurrency } = useCurrency();
  const { formatDateTime } = useDateFormat();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: returnsData = [], isLoading } = useGetPurchaseReturns();
  const purchaseReturns = Array.isArray(returnsData)
    ? returnsData
    : (returnsData as any)?.data || [];

  const filteredReturns = useMemo(() => {
    if (!purchaseReturns) return [];
    return purchaseReturns.filter((ret: any) => {
      const matchesSearch =
        (ret.invoiceNo || ret.returnInvoiceNo || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (ret.supplier?.name || ret.supplierName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        ret.items?.some((item: any) =>
          item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      const matchesStatus =
        statusFilter === "all" || ret.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [purchaseReturns, searchTerm, statusFilter]);

  // Calculate summary stats
  const stats = useMemo(() => {
    if (!purchaseReturns || purchaseReturns.length === 0) {
      return { today: 0, month: 0, count: 0, totalRefund: 0 };
    }
    const count = purchaseReturns.length;
    const totalRefund = purchaseReturns.reduce(
      (sum: number, r: any) => sum + (r.total || r.refundAmount || 0),
      0,
    );
    const today = totalRefund;
    const month = totalRefund;

    return { today, month, count, totalRefund };
  }, [purchaseReturns]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <RotateCcw className="h-6 w-6 text-primary" />
            {isBangla ? "পারচেজ রিটার্ন" : "Purchase Returns"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 whitespace-nowrap">
            {isBangla
              ? "ফেরতকৃত ক্রয়, সাপ্লায়ার রিফান্ড এবং রিটার্ন ইতিহাস পরিচালনা করুন"
              : "Manage returned purchases, supplier refunds, and purchase return history."}
          </p>
        </div>
        <Link href="/purchases/returns/new">
          <Button className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            <span className="whitespace-nowrap">
              {isBangla ? "নতুন রিটার্ন" : "New Purchase Return"}
            </span>
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Today's Returns"
          titleBn="আজকের রিটার্ন"
          value={stats.today}
          prefix="৳"
          trend={{ value: 10.5, isPositive: true }}
          icon={<RotateCcw className="h-5 w-5" />}
          iconColor="emerald"
          isBangla={isBangla}
        />
        <KPICard
          title="This Month Returns"
          titleBn="এই মাসের রিটার্ন"
          value={stats.month}
          prefix="৳"
          trend={{ value: 6.8, isPositive: true }}
          icon={<Truck className="h-5 w-5" />}
          iconColor="indigo"
          isBangla={isBangla}
        />
        <KPICard
          title="Return Invoices"
          titleBn="রিটার্ন ইনভয়েস"
          value={stats.count}
          trend={{ value: 4, isPositive: true }}
          icon={<Receipt className="h-5 w-5" />}
          iconColor="warning"
          isBangla={isBangla}
        />
        <KPICard
          title="Refund Received"
          titleBn="রিফান্ড প্রাপ্তি"
          value={stats.totalRefund}
          prefix="৳"
          icon={<Banknote className="h-5 w-5" />}
          iconColor="emerald"
          isBangla={isBangla}
        />
      </div>

      {/* Filters */}
      <Card variant="elevated" padding="default">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground shrink-0" />
            <Input
              placeholder={
                isBangla
                  ? "রিটার্ন ইনভয়েস, সরবরাহকারী বা পণ্য খুঁজুন..."
                  : "Search return invoice, supplier, or product..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[160px]">
              <SelectValue placeholder={isBangla ? "স্ট্যাটাস" : "Status"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isBangla ? "সব" : "All"}</SelectItem>
              <SelectItem value="completed">
                {isBangla ? "সম্পন্ন" : "Completed"}
              </SelectItem>
              <SelectItem value="pending">
                {isBangla ? "অপেক্ষমান" : "Pending"}
              </SelectItem>
              <SelectItem value="approved">
                {isBangla ? "অনুমোদিত" : "Approved"}
              </SelectItem>
              <SelectItem value="rejected">
                {isBangla ? "বাতিল" : "Rejected"}
              </SelectItem>
              <SelectItem value="refunded">
                {isBangla ? "রিফান্ডেড" : "Refunded"}
              </SelectItem>
              <SelectItem value="processing">
                {isBangla ? "প্রক্রিয়াধীন" : "Processing"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Purchase Returns Table */}
      <div className="rounded-xl border border-[#1e2738] bg-[#131823] shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1f283c] flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 tracking-tight">
            {isBangla ? "পারচেজ রিটার্ন ইতিহাস" : "Purchase Return History"}
          </h2>
          <span className="text-xs font-medium text-[#718296]">
            {filteredReturns.length} {isBangla ? "টি রিটার্ন" : "returns total"}
          </span>
        </div>

        <div>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : filteredReturns.length === 0 ? (
            <EmptyState
              icon={<RotateCcw className="h-8 w-8" />}
              title={
                isBangla
                  ? "কোনো পারচেজ রিটার্ন নেই"
                  : "No Purchase Returns Found"
              }
              description={
                isBangla
                  ? "সরবরাহকারীকে পণ্য ফেরত দিলে পারচেজ রিটার্ন রেকর্ড এখানে দেখা যাবে।"
                  : "Purchase return records will appear here after returning items to suppliers."
              }
              isBangla={isBangla}
              action={
                <Button onClick={() => router.push("/purchases/returns/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="whitespace-nowrap">
                    {isBangla ? "নতুন রিটার্ন" : "Create Purchase Return"}
                  </span>
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-b-[#1f283c] bg-[#131823] text-[#718296] text-[12px] font-semibold tracking-wide">
                    <th className="px-4 py-3.5 whitespace-nowrap">
                      {isBangla ? "ক্রম" : "SL."}
                    </th>
                    <th className="px-4 py-3.5 whitespace-nowrap">
                      {isBangla ? "রিটার্ন ইনভয়েস" : "Return Invoice"}
                    </th>
                    <th className="px-4 py-3.5 whitespace-nowrap">
                      {isBangla ? "সরবরাহকারী" : "Supplier"}
                    </th>
                    <th className="px-4 py-3.5 whitespace-nowrap">
                      {isBangla ? "রিটার্ন তারিখ" : "Return Date"}
                    </th>
                    <th className="px-4 py-3.5 whitespace-nowrap">
                      {isBangla ? "ফেরতকৃত পণ্য" : "Returned Items"}
                    </th>
                    <th className="px-4 py-3.5 whitespace-nowrap">
                      {isBangla ? "রিফান্ড পদ্ধতি" : "Refund Method"}
                    </th>
                    <th className="px-4 py-3.5 whitespace-nowrap">
                      {isBangla ? "রিফান্ড পরিমাণ" : "Refund Amount"}
                    </th>
                    <th className="px-4 py-3.5 whitespace-nowrap">
                      {isBangla ? "প্রাপ্তি" : "Received"}
                    </th>
                    <th className="px-4 py-3.5 whitespace-nowrap">
                      {isBangla ? "বকেয়া রিফান্ড" : "Pending Refund"}
                    </th>
                    <th className="px-4 py-3.5 whitespace-nowrap">
                      {isBangla ? "স্ট্যাটাস" : "Status"}
                    </th>
                    <th className="px-4 py-3.5 text-right whitespace-nowrap">
                      {isBangla ? "অ্যাকশন" : "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1b2231] bg-[#131823]">
                  {filteredReturns.map((ret: any, index: number) => {
                    const statusConfig: Record<
                      string,
                      { label: string; color: string }
                    > = {
                      completed: {
                        label: isBangla ? "সম্পন্ন" : "Completed",
                        color:
                          "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                      },
                      pending: {
                        label: isBangla ? "অপেক্ষমান" : "Pending",
                        color:
                          "text-amber-400 bg-amber-500/10 border-amber-500/20",
                      },
                      approved: {
                        label: isBangla ? "অনুমোদিত" : "Approved",
                        color:
                          "text-blue-400 bg-blue-500/10 border-blue-500/20",
                      },
                      rejected: {
                        label: isBangla ? "বাতিল" : "Rejected",
                        color:
                          "text-rose-400 bg-rose-500/10 border-rose-500/20",
                      },
                      refunded: {
                        label: isBangla ? "রিফান্ডেড" : "Refunded",
                        color:
                          "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
                      },
                      processing: {
                        label: isBangla ? "প্রক্রিয়াধীন" : "Processing",
                        color:
                          "text-orange-400 bg-orange-500/10 border-orange-500/20",
                      },
                      cancelled: {
                        label: isBangla ? "বাতিল" : "Cancelled",
                        color:
                          "text-rose-400 bg-rose-500/10 border-rose-500/20",
                      },
                    };

                    const status =
                      statusConfig[ret.status] || statusConfig.completed;
                    const slNumber = String(index + 1).padStart(2, "0");
                    const invoiceNo =
                      ret.returnInvoiceNo ||
                      ret.invoiceNo ||
                      `PRET-${(ret.id || "").slice(-6)}`;
                    const supplierName =
                      ret.supplier?.name ||
                      ret.supplierName ||
                      ret.party?.name ||
                      (isBangla ? "সাধারণ সরবরাহকারী" : "Supplier");
                    const returnDate = ret.createdAt
                      ? formatDateTime(ret.createdAt)
                      : "—";
                    const itemsCount = ret.items?.length || 0;
                    const refundMethod = ret.refundMethod || ret.paymentMethod || "Cash";
                    const totalRefund = ret.total || ret.refundAmount || 0;
                    const receivedAmount = ret.paidAmount || ret.receivedAmount || totalRefund;
                    const dueAmount = ret.dueAmount || Math.max(0, totalRefund - receivedAmount);

                    return (
                      <tr
                        key={ret.id || index}
                        className="hover:bg-[#1a2130]/80 transition-colors cursor-pointer"
                        onClick={() =>
                          router.push(`/purchases/returns/${ret.id}`)
                        }
                      >
                        <td className="px-4 py-4 text-[#718296] font-mono text-xs font-medium whitespace-nowrap">
                          {slNumber}
                        </td>
                        <td className="px-4 py-4 text-[#718296] font-mono text-xs font-medium whitespace-nowrap">
                          {invoiceNo}
                        </td>
                        <td className="px-4 py-4 text-slate-100 font-semibold text-sm whitespace-nowrap">
                          {supplierName}
                        </td>
                        <td className="px-4 py-4 text-[#718296] text-xs whitespace-nowrap">
                          {returnDate}
                        </td>
                        <td className="px-4 py-4 text-slate-200 text-xs font-medium whitespace-nowrap">
                          {itemsCount} {isBangla ? "টি" : "item(s)"}
                        </td>
                        <td className="px-4 py-4 text-slate-300 text-xs capitalize whitespace-nowrap">
                          {refundMethod}
                        </td>
                        <td className="px-4 py-4 font-bold text-slate-100 text-sm whitespace-nowrap">
                          {formatCurrency(totalRefund)}
                        </td>
                        <td className="px-4 py-4 font-bold text-emerald-400 text-sm whitespace-nowrap">
                          {formatCurrency(receivedAmount)}
                        </td>
                        <td className="px-4 py-4 font-bold text-sm whitespace-nowrap">
                          <span
                            className={
                              dueAmount > 0
                                ? "text-rose-400"
                                : "text-[#718296]"
                            }
                          >
                            {formatCurrency(dueAmount)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${status.color}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {status.label}
                          </span>
                        </td>
                        <td
                          className="px-4 py-4 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              title={isBangla ? "রিটার্ন দেখুন" : "View Return"}
                              className="p-1.5 rounded-md text-[#718296] hover:text-white hover:bg-[#202738] transition-colors"
                              onClick={() =>
                                router.push(`/purchases/returns/${ret.id}`)
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              title={
                                isBangla
                                  ? "রিটার্ন প্রিন্ট করুন"
                                  : "Print Return"
                              }
                              className="p-1.5 rounded-md text-[#718296] hover:text-white hover:bg-[#202738] transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log("Print Return");
                              }}
                            >
                              <Printer className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

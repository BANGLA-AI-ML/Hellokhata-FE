'use client';

import React, { useState, useMemo } from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/common';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAppTranslation, useCurrency } from '@/hooks/useAppTranslation';
import { useGetTransactions } from '@/hooks/api/useFinance';
import { cn } from '@/lib/utils';
import {
  ArrowLeftRight,
  RefreshCw,
  Search,
  Download,
  Coins,
  FileClock,
  FileText,
  Eye,
  Loader2,
  TrendingUp,
  TrendingDown,
  Scale,
  Calendar,
} from 'lucide-react';

export interface Transaction {
  id: string;
  transactionType: string;
  flow: 'IN' | 'OUT' | string;
  amount: number;
  date: string;
  title?: string | null;
  description?: string | null;
  reference?: string | null;
  partyId?: string | null;
  partyName?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  branchId?: string | null;
  accountId?: string | null;
  mode?: string | null;
  receipt?: string | null;
  createdAt?: string;
}

export default function FinanceTransactionsPage() {
  const { isBangla } = useAppTranslation();
  const { formatCurrency } = useCurrency();

  // API Hook
  const { data: rawTransactions, isLoading, isError, refetch, isFetching } = useGetTransactions();

  const transactionsList: Transaction[] = useMemo(() => {
    if (!rawTransactions) return [];
    if (Array.isArray(rawTransactions)) return rawTransactions;
    if (Array.isArray((rawTransactions as any).data)) return (rawTransactions as any).data;
    return [];
  }, [rawTransactions]);

  // State Management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [selectedFlow, setSelectedFlow] = useState('all');

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null);

  const handleOpenDetails = (txn: Transaction) => {
    setActiveTransaction(txn);
    setIsDetailsOpen(true);
  };

  // Helper date formatter
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toISOString().split('T')[0];
    } catch {
      return dateStr || '-';
    }
  };

  // Filtering transactions
  const filteredTransactions = useMemo(() => {
    return transactionsList.filter((t) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.id?.toLowerCase().includes(q) ||
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.categoryName?.toLowerCase().includes(q) ||
        t.partyName?.toLowerCase().includes(q) ||
        t.mode?.toLowerCase().includes(q) ||
        t.transactionType?.toLowerCase().includes(q);

      const matchesType =
        selectedType === 'all' ||
        t.transactionType?.toUpperCase() === selectedType.toUpperCase();

      const matchesMethod =
        selectedMethod === 'all' ||
        t.mode?.toLowerCase().includes(selectedMethod.toLowerCase());

      const matchesFlow =
        selectedFlow === 'all' ||
        t.flow?.toUpperCase() === selectedFlow.toUpperCase();

      return matchesSearch && matchesType && matchesMethod && matchesFlow;
    });
  }, [transactionsList, searchTerm, selectedType, selectedMethod, selectedFlow]);

  // Totals calculations
  const totalInflows = useMemo(() => {
    return transactionsList
      .filter((t) => t.flow === 'IN' || ['INCOME', 'SALES', 'DEPOSIT'].includes(t.transactionType?.toUpperCase()))
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  }, [transactionsList]);

  const totalOutflows = useMemo(() => {
    return transactionsList
      .filter((t) => t.flow === 'OUT' || ['EXPENSE', 'WITHDRAWAL', 'TRANSFER', 'LOAN'].includes(t.transactionType?.toUpperCase()))
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  }, [transactionsList]);

  const netBalance = totalInflows - totalOutflows;
  const totalCount = filteredTransactions.length;

  const activeFiltersCount =
    (searchTerm ? 1 : 0) +
    (selectedType !== 'all' ? 1 : 0) +
    (selectedMethod !== 'all' ? 1 : 0) +
    (selectedFlow !== 'all' ? 1 : 0);

  const handleExport = (type: string) => {
    alert(isBangla ? `${type} এক্সপোর্ট সিমুলেশন সম্পন্ন!` : `${type} export simulation completed!`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumbs Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1.5">
          {/* <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-muted-foreground hover:text-foreground">
                  {isBangla ? 'ড্যাশবোর্ড' : 'Dashboard'}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="text-muted-foreground">
                  {isBangla ? 'অর্থায়ন ও হিসাববিজ্ঞান' : 'Finance & Accounting'}
                </span>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-foreground">
                  {isBangla ? 'লেনদেন রেজিস্টার' : 'Transactions Ledger'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb> */}
          <div className="flex items-center gap-3">
            <BackButton fallbackHref="/finance" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {isBangla ? 'লেনদেন খাতা রেজিস্টার' : 'Transactions Ledger'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isBangla
                  ? 'আপনার ব্যবসায়ের সমস্ত আর্থিক লেনদেন দেখুন, রেকর্ড করুন এবং পরিচালনা করুন।'
                  : 'View, record, and manage every financial transaction ledger across your business.'}
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar Trigger Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5 text-xs h-9"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
            <span>{isBangla ? 'রিফ্রেশ' : 'Refresh'}</span>
          </Button>
          <Button variant="outline" onClick={() => handleExport('Excel')} className="gap-1.5 text-xs h-9">
            <Download className="h-3.5 w-3.5" />
            <span>{isBangla ? 'এক্সপোর্ট' : 'Export'}</span>
          </Button>
        </div>
      </div>

      {/* 2. Dynamic Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{isBangla ? 'মোট লেনদেন' : 'Total Transactions'}</p>
              <h3 className="text-xl font-bold text-foreground mt-1 font-mono">{totalCount}</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{isBangla ? 'মোট জমা (ইনফ্লো)' : 'Total Inflows'}</p>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">{formatCurrency(totalInflows)}</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Coins className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{isBangla ? 'মোট খরচ (আউটফ্লো)' : 'Total Outflows'}</p>
              <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1 font-mono">{formatCurrency(totalOutflows)}</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <FileClock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-card to-primary/[0.01]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-primary">{isBangla ? 'নেট ব্যালেন্স' : 'Net Balance'}</p>
              <h3 className={cn(
                'text-xl font-bold mt-1 font-mono',
                netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              )}>
                {formatCurrency(netBalance)}
              </h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Scale className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Toolbar Search & Filters */}
      <div className="border border-border/30 rounded-xl overflow-hidden bg-card/40 p-1 flex flex-col sm:flex-row gap-1 items-center justify-between">
        {/* Left Side: Search Box */}
        <div className="relative w-full sm:w-60 shrink-0">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder={isBangla ? 'লেনদেন খুঁজুন (আইডি, নাম, পার্টি)...' : 'Search (ID, name, party)...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 h-7 text-[11px] bg-background/50 rounded-lg border-border/20 focus-visible:ring-primary/20"
          />
        </div>

        {/* Right Side: Grouped Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-1 justify-end w-full sm:w-auto">
          {/* Flow Select */}
          <select
            value={selectedFlow}
            onChange={(e) => setSelectedFlow(e.target.value)}
            className="h-7 rounded-lg border border-border/30 bg-background/50 px-1.5 text-[11px] shadow-sm focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer text-muted-foreground font-medium"
          >
            <option value="all">{isBangla ? 'সব ফ্লো' : 'All Flows'}</option>
            <option value="IN">{isBangla ? 'ইনফ্লো (IN)' : 'Inflow (IN)'}</option>
            <option value="OUT">{isBangla ? 'আউটফ্লো (OUT)' : 'Outflow (OUT)'}</option>
          </select>

          {/* Type Select */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-7 rounded-lg border border-border/30 bg-background/50 px-1.5 text-[11px] shadow-sm focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer text-muted-foreground font-medium"
          >
            <option value="all">{isBangla ? 'সব ধরণের লেনদেন' : 'All Types'}</option>
            <option value="EXPENSE">{isBangla ? 'ব্যয় (Expense)' : 'Expense'}</option>
            <option value="INCOME">{isBangla ? 'আয় (Income)' : 'Income'}</option>
            <option value="SALES">{isBangla ? 'বিক্রয় (Sales)' : 'Sales'}</option>
            <option value="PURCHASE">{isBangla ? 'ক্রয় (Purchase)' : 'Purchase'}</option>
            <option value="DEPOSIT">{isBangla ? 'জমা (Deposit)' : 'Deposit'}</option>
            <option value="WITHDRAWAL">{isBangla ? 'উত্তোলন (Withdrawal)' : 'Withdrawal'}</option>
            <option value="TRANSFER">{isBangla ? 'স্থানান্তর (Transfer)' : 'Transfer'}</option>
            <option value="LOAN">{isBangla ? 'ঋণ (Loan)' : 'Loan'}</option>
          </select>

          {/* Method Select */}
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="h-7 rounded-lg border border-border/30 bg-background/50 px-1.5 text-[11px] shadow-sm focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer text-muted-foreground font-medium"
          >
            <option value="all">{isBangla ? 'সব পেমেন্ট পদ্ধতি' : 'All Methods'}</option>
            <option value="cash">{isBangla ? 'নগদ (Cash)' : 'Cash'}</option>
            <option value="bank">{isBangla ? 'ব্যাংক (Bank)' : 'Bank'}</option>
            <option value="card">{isBangla ? 'কার্ড (Card)' : 'Card'}</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
          </select>

          {/* Reset filters action */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedMethod('all');
                setSelectedFlow('all');
              }}
              className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 text-[11px] h-7 px-1.5 shrink-0 transition-colors"
            >
              {isBangla ? 'রিসেট' : 'Reset'}
            </Button>
          )}
        </div>
      </div>

      {/* 4. Table view registry */}
      <Card className="border-border/50 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30 border-b border-border/20 text-muted-foreground font-semibold">
              <TableRow>
                <TableHead className="p-3">{isBangla ? 'তারিখ' : 'Date'}</TableHead>
                <TableHead className="p-3">{isBangla ? 'লেনদেন আইডি' : 'TXN ID'}</TableHead>
                <TableHead className="p-3">{isBangla ? 'লেনদেনের ধরণ' : 'Type'}</TableHead>
                <TableHead className="p-3">{isBangla ? 'হিসাবের নাম' : 'Title'}</TableHead>
                <TableHead className="p-3">{isBangla ? 'বিবরণ' : 'Description'}</TableHead>
                <TableHead className="p-3">{isBangla ? 'পার্টি' : 'Particulars/Party'}</TableHead>
                <TableHead className="p-3 text-right">{isBangla ? 'পরিমাণ' : 'Amount'}</TableHead>
                <TableHead className="p-3">{isBangla ? 'পদ্ধতি' : 'Method'}</TableHead>
                <TableHead className="p-3 text-center">{isBangla ? 'অ্যাকশন' : 'Action'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/10">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-64 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <p className="text-sm font-medium">
                        {isBangla ? 'লেনদেন লোড হচ্ছে...' : 'Loading transactions...'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-64 text-center text-rose-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-sm font-medium">
                        {isBangla ? 'লেনদেন লোড করতে সমস্যা হয়েছে।' : 'Failed to load transactions.'}
                      </p>
                      <Button variant="outline" size="sm" onClick={() => refetch()} className="h-8 text-xs">
                        {isBangla ? 'পুনরায় চেষ্টা করুন' : 'Retry'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-64 text-center text-muted-foreground font-semibold">
                    {isBangla ? 'কোনো লেনদেন এন্ট্রি পাওয়া যায়নি।' : 'No financial transaction records found.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((txn) => {
                  const isInflow = txn.flow === 'IN' || ['INCOME', 'SALES', 'DEPOSIT'].includes(txn.transactionType?.toUpperCase());
                  const accountName = txn.categoryName || txn.title || txn.accountId || '-';
                  const description = txn.description || txn.title || '-';
                  const party = txn.partyName || txn.reference || '-';
                  const method = txn.mode || '-';

                  return (
                    <TableRow key={txn.id} className="hover:bg-muted/5">
                      <td className="p-3 font-mono text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(txn.date)}
                      </td>
                      <td className="p-3 font-mono font-bold text-primary text-xs" title={txn.id}>
                        #{txn.id.length > 10 ? txn.id.slice(-8) : txn.id}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[9px] py-0.5 px-2 rounded-md border-transparent font-bold uppercase',
                            isInflow
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          )}
                        >
                          {txn.transactionType}
                        </Badge>
                      </td>
                      <td className="p-3 font-semibold text-foreground text-xs">{accountName}</td>
                      <td className="p-3 text-muted-foreground text-xs max-w-[220px] truncate" title={description}>
                        {description}
                      </td>
                      <td className="p-3 font-medium text-foreground text-xs">{party}</td>
                      <td className={cn(
                        'p-3 text-right font-mono font-medium text-xs whitespace-nowrap',
                        isInflow ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      )}>
                        {isInflow ? `+${formatCurrency(txn.amount)}` : `-${formatCurrency(txn.amount)}`}
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">{method}</td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleOpenDetails(txn)}
                            className="h-7 w-7 text-primary hover:bg-primary/10"
                            title={isBangla ? 'বিস্তারিত দেখুন' : 'View Details'}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* 5. Transaction Details dialog popup */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>{isBangla ? 'লেনদেনের বিবরণ ভাউচার' : 'Transaction Details'}</span>
            </DialogTitle>
          </DialogHeader>

          {activeTransaction && (
            <div className="space-y-4 text-xs font-medium border-t pt-3 border-border/20">
              <div className="flex justify-between items-center bg-muted/40 p-2.5 rounded-lg border">
                <div>
                  <p className="text-[10px] text-muted-foreground">{isBangla ? 'ভাউচার / লেনদেন আইডি' : 'TRANSACTION ID'}</p>
                  <p className="font-bold text-primary font-mono text-xs mt-0.5 break-all">{activeTransaction.id}</p>
                </div>
                <Badge
                  className={cn(
                    'rounded-md text-[10px] py-0.5 px-2 font-bold border-transparent uppercase',
                    activeTransaction.flow === 'IN' || ['INCOME', 'SALES', 'DEPOSIT'].includes(activeTransaction.transactionType?.toUpperCase())
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  )}
                >
                  {activeTransaction.transactionType} ({activeTransaction.flow || 'N/A'})
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground">{isBangla ? 'লেনদেনের তারিখ' : 'DATE'}</p>
                  <p className="font-semibold text-foreground mt-0.5 font-mono">{formatDate(activeTransaction.date)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">{isBangla ? 'হিসাবের নাম / ক্যাটাগরি' : 'ACCOUNT / CATEGORY'}</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {activeTransaction.categoryName || activeTransaction.title || '-'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground">{isBangla ? 'পেমেন্ট পদ্ধতি' : 'PAYMENT METHOD'}</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {activeTransaction.mode || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">{isBangla ? 'সংশ্লিষ্ট পার্টি' : 'PARTICULARS / PARTY'}</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {activeTransaction.partyName || '-'}
                  </p>
                </div>
              </div>

              {activeTransaction.reference && (
                <div>
                  <p className="text-[10px] text-muted-foreground">{isBangla ? 'রেফারেন্স' : 'REFERENCE'}</p>
                  <p className="font-semibold text-foreground mt-0.5">{activeTransaction.reference}</p>
                </div>
              )}

              <div className="border-t pt-3 border-border/10">
                <p className="text-[10px] text-muted-foreground">{isBangla ? 'লেনদেনের বিবরণ' : 'DESCRIPTION'}</p>
                <p className="text-muted-foreground mt-0.5 italic leading-relaxed">
                  {activeTransaction.description || activeTransaction.title || '-'}
                </p>
              </div>

              <div className="p-3 bg-muted/40 rounded-lg border flex justify-between items-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{isBangla ? 'মোট পরিমাণ' : 'TOTAL AMOUNT'}</p>
                <p className={cn(
                  'text-base font-bold font-mono',
                  activeTransaction.flow === 'IN' || ['INCOME', 'SALES', 'DEPOSIT'].includes(activeTransaction.transactionType?.toUpperCase())
                    ? 'text-emerald-600 dark:text-emerald-500'
                    : 'text-rose-600 dark:text-rose-400'
                )}>
                  {formatCurrency(activeTransaction.amount)}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button onClick={() => setIsDetailsOpen(false)} className="text-xs h-9 w-full sm:w-auto">
              {isBangla ? 'বন্ধ করুন' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

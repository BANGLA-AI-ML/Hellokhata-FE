'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useRouter } from 'next/navigation';
import { PaginationHelper } from '@/components/shared/PaginationHelper';
import { useGetBatches, useGetBatchesStatus } from '@/hooks/api/useBatches';
import { useGetOffers } from '@/hooks/api/useOffers';
import {
  BatchHeader,
  BatchToolbar,
  BatchRow,
  BatchEmptyState,
  BatchLoadingSkeleton,
  type BatchRowData,
  type StatusTab,
} from '@/components/inventory/batches';
import { EditBatchDetailsModal } from '@/components/inventory/batches/EditBatchDetailsModal';
import { AdjustmentForm } from '@/components/inventory/batches/AdjustmentForm';
import type { BatchStatus, BatchSort } from '@/services/batches.services';
import { toast } from 'sonner';

export default function BatchesPage() {
  const { isBangla } = useAppTranslation();
  const router = useRouter();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusTab>('all');
  const [branchFilter, setBranchFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<BatchSort>('received_desc');
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  // Batch Detail Sheet & Modal States
  const [inspectingBatchId, setInspectingBatchId] = useState<string | null>(null);
  const [inspectingFallback, setInspectingFallback] = useState<BatchRowData | null>(null);
  const [editingBatch, setEditingBatch] = useState<BatchRowData | null>(null);
  const [adjustingBatch, setAdjustingBatch] = useState<BatchRowData | null>(null);

  // Data fetching
  const branches = [{ id: 'main', name: 'Main Branch' }];
  const isMultiBranch = branches.length > 1;

  const { data: batchesStatusData } = useGetBatchesStatus();
  const batchesStatus = batchesStatusData?.data;

  const { data: offersRes } = useGetOffers();
  const offers = offersRes?.data || [];

  const { data: batchesData, isLoading, isError, refetch } = useGetBatches({
    search: debouncedSearch || undefined,
    status: statusFilter === 'all' ? undefined : (statusFilter as BatchStatus),
    branchId: branchFilter.trim() ? branchFilter : undefined,
    sort: sortOrder,
    page,
    limit: LIMIT,
  });

  // Map API response items into robust BatchRowData format
  const batches: BatchRowData[] = useMemo(() => {
    const raw = batchesData?.data || [];
    return raw.map((b: any) => ({
      id: b.id,
      batchNumber: b.batchNumber,
      itemId: b.itemId,
      itemName: b.itemName || b.item?.name,
      itemImage: b.item?.image,
      unit: b.item?.unit || 'pcs',
      category: b.item?.category,
      quantity: b.quantity,
      quantityReceived: b.quantityReceived,
      costPrice: b.costPrice,
      sellingPrice: b.sellingPrice,
      offer: b.offer || b.activeOffer,
      expiryDate: b.expiryDate,
      manufactureDate: b.manufactureDate,
      receivedDate: b.receivedDate || b.createdAt,
      supplier: b.supplier,
      branchName: b.branch?.name || b.branchName,
      branchId: b.branchId,
      barcode: b.barcode,
      barcodeType: b.barcodeType || b.item?.barcodeType,
      manufacturerBarcode: b.manufacturerBarcode || b.item?.manufacturerBarcode,
      source: b.source,
      hasExpiry: b.hasExpiry ?? b.item?.hasExpiry,
      isExpired: b.isExpired,
      isExpiringSoon: b.isExpiringSoon,
      isActive: b.isActive,
      daysUntilExpiry: b.daysUntilExpiry,
      createdAt: b.createdAt,
      status: b.status,
    }));
  }, [batchesData]);

  const totalBatchesCount = batchesData?.meta?.total ?? batches.length;
  const totalPages = Math.ceil(totalBatchesCount / LIMIT);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);


  // Batch item click handler
  const handleBatchTap = useCallback((batch: BatchRowData) => {
    setInspectingFallback(batch);
    setInspectingBatchId(batch.batchNumber);
  }, []);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setStatusFilter('all');
    setBranchFilter('');
    setSortOrder('received_desc');
    setPage(1);
  };

  const hasActiveFilters = !!(debouncedSearch || statusFilter !== 'all' || branchFilter.trim());

  return (
    <div className="min-h-screen space-y-4 pb-20">
      {/* Page Header */}
      <BatchHeader
        // totalBatches={batchesStatus?.totalBatches }
        onAddBatch={() => router.push('/inventory/new')}
      />

      <div className="mx-aut space-y-4">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border border-border/60 shadow-xs">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    {isBangla ? 'মোট ব্যাচ' : 'Total Batches'}
                  </p>
                  <p className="text-lg font-bold font-mono text-foreground">
                    {batchesStatus?.totalBatches || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-rose-500/20 bg-rose-50/20 dark:bg-rose-950/10 shadow-xs">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-rose-500/15 flex items-center justify-center shrink-0">
                  <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <p className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">
                    {isBangla ? 'মেয়াদোত্তীর্ণ' : 'Expired'}
                  </p>
                  <p className="text-lg font-bold font-mono text-rose-700 dark:text-rose-400">
                    {batchesStatus?.expired || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/10 shadow-xs">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                    {isBangla ? '৩০ দিনের মধ্যে' : 'Expiring Soon'}
                  </p>
                  <p className="text-lg font-bold font-mono text-amber-700 dark:text-amber-400">
                    {batchesStatus?.expiringIn30Days || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-xs">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    {isBangla ? 'সক্রিয় ব্যাচ' : 'Active Batches'}
                  </p>
                  <p className="text-lg font-bold font-mono text-foreground">
                    {batchesStatus?.activeBatches || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search + Filter Toolbar */}
        <BatchToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          branchFilter={branchFilter}
          onBranchFilterChange={setBranchFilter}
          branches={branches}
          isMultiBranch={isMultiBranch}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />

        {/* Batch Table Container - Styled Exactly like Inventory Items Table */}
        <div className="rounded-2xl border border-border/60 bg-[#12161f] shadow-sm overflow-hidden">
          <div className="px-6 pt-5 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">
              {isBangla ? 'ব্যাচ তালিকা' : 'Batch List'}
            </h3>
            <span className="text-xs font-mono text-muted-foreground/80">
              {totalBatchesCount} {isBangla ? 'টি ব্যাচ' : 'batches'}
            </span>
          </div>

          {isLoading ? (
            <BatchLoadingSkeleton />
          ) : isError ? (
            <BatchEmptyState type="error" onAction={() => refetch()} />
          ) : batches.length === 0 ? (
            hasActiveFilters ? (
              <BatchEmptyState type="filtered_empty" onResetFilters={handleResetFilters} />
            ) : (
              <BatchEmptyState type="no_data" onAction={() => router.push('/purchases/new')} />
            )
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[1050px] w-full">
                {/* Column Header Bar - Matches Inventory Items Table Column Headers */}
                <div className="flex items-center justify-between w-full px-6 py-3 bg-[#161a23]/60 text-xs font-semibold text-muted-foreground/80 border-b border-border/40 gap-4">
                  <div className="w-8 text-left shrink-0">SL.</div>
                  <div className="w-36 text-left shrink-0">{isBangla ? 'ব্যাচ' : 'Batch'}</div>
                  <div className="w-52 text-left shrink-0">{isBangla ? 'পণ্য' : 'Product'}</div>
                  <div className="w-24 text-left shrink-0">{isBangla ? 'অবশিষ্ট' : 'Available'}</div>
                  <div className="w-20 text-right shrink-0">{isBangla ? 'ক্রয় মূল্য' : 'Cost'}</div>
                  <div className="w-20 text-right shrink-0">{isBangla ? 'বিক্রয় মূল্য' : 'Selling'}</div>
                  <div className="w-28 text-left shrink-0">{isBangla ? 'মেয়াদ' : 'Expiry'}</div>
                  <div className="w-24 text-center shrink-0">{isBangla ? 'স্ট্যাটাস' : 'Status'}</div>
                  <div className="w-12 text-right shrink-0">{isBangla ? 'অ্যাকশন' : 'Actions'}</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-border/30">
                  {batches.map((batch, index) => {
                    const activeOffer = offers.find(
                      (o: any) =>
                        o.status === 'active' &&
                        (o.batchId === batch.id || (!o.batchId && o.productId === batch.itemId))
                    );
                    return (
                      <BatchRow
                        key={batch.id}
                        batch={batch}
                        index={index}
                        showBranch={isMultiBranch}
                        offer={activeOffer}
                        // onTap={handleBatchTap}
                        // onViewDetails={handleBatchTap}
                        onEdit={(b) => setEditingBatch(b)}
                        onAdjust={(b) => setAdjustingBatch(b)}
                        onCreateOffer={(b) => router.push(`/inventory/promotions/new?batchId=${b.id}&productId=${b.itemId || ''}`)}
                        onPrintLabel={(b) => {
                          toast.info(
                            isBangla
                              ? `ব্যাচ #${b.batchNumber} লেবেল প্রিন্টারে পাঠানো হচ্ছে...`
                              : `Sending label for Batch #${b.batchNumber} to printer...`
                          );
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="px-6 pb-4 bg-muted/5">
              <PaginationHelper
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                isBangla={isBangla}
              />
            </div>
          )}
        </div>
      </div>

      {/* Batch Detail Panel (Commented off) */}
      {/* <BatchDetailSheet
        batchId={inspectingBatchId}
        isOpen={!!inspectingBatchId}
        onClose={() => {
          setInspectingBatchId(null);
          setInspectingFallback(null);
        }}
        fallbackBatch={inspectingFallback}
      /> */}

      {/* Edit Batch Details Modal */}
      {editingBatch && (
        <EditBatchDetailsModal
          isOpen={!!editingBatch}
          onClose={() => setEditingBatch(null)}
          batchId={editingBatch.id}
          batchNumber={editingBatch.batchNumber}
          initialSupplier={editingBatch.supplier}
          initialMfgDate={editingBatch.manufactureDate}
        />
      )}

      {/* Stock Adjustment Form Modal */}
      {adjustingBatch && (
        <AdjustmentForm
          isOpen={!!adjustingBatch}
          onClose={() => setAdjustingBatch(null)}
          batchId={adjustingBatch.id}
          batchNumber={adjustingBatch.batchNumber}
          currentQuantity={adjustingBatch.quantity}
          unit={adjustingBatch.unit || 'pcs'}
        />
      )}
    </div>
  );
}

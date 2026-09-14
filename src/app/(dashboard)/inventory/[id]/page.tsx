// Hello Khata OS - Product Details Page (Inventory Focused ERP Experience)
// হ্যালো খাতা - পণ্য বিবরণী ও ইনভেন্টরি পেজ

"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProductHeader } from "@/components/product-details/ProductHeader";
import { ProductIdentityCard } from "@/components/product-details/ProductIdentityCard";
import { ProductInformationCard } from "@/components/product-details/ProductInformationCard";
import { BatchTable } from "@/components/product-details/BatchTable";
import { BranchStockTable } from "@/components/product-details/BranchStockTable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  mockProduct,
  mockBatches,
  mockBranchStocks,
  mockBarcodes,
  Product,
} from "@/components/product-details/mock-data";
import {
  Loader2,
  Package,
  Layers,
  Store,
  FileText,
} from "lucide-react";
import { useGetSingleItem } from "@/hooks/api/useItems";

function ProductDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: itemData, isLoading: isItemLoading } = useGetSingleItem(id);
  const item = itemData?.data;

  const [activeTab, setActiveTab] = useState("overview");

  const product: Product = useMemo(() => {
    if (!item) return mockProduct;
    return {
      id: item.id,
      name: item.name || mockProduct.name,
      category: item.category?.name || item.category || mockProduct.category,
      brand: mockProduct.brand,
      unit: item.unit || "pcs",
      sku: item.sku || "N/A",
      barcode: item.barcode || mockProduct.barcode,
      imageUrl: item.imageUrl || "",
      costPrice: item.costPrice || 0,
      sellingPrice: item.sellingPrice || 0,
      totalStock: item.currentStock || 0,
      availableStock: item.currentStock ? Math.max(0, item.currentStock - 25) : 0,
      reservedStock: 25,
      damagedStock: 5,
      inTransitStock: 5,
      totalBranches: 4,
      totalBatches: 4,
      lastUpdated: item.updatedAt || item.createdAt || new Date().toISOString(),
      status: "Active",
      taxRate: 5,
      description: item.description || mockProduct.description,
      preferredSupplier: mockProduct.preferredSupplier,
      supplierContact: mockProduct.supplierContact,
      supplierEmail: mockProduct.supplierEmail,
      minStockAlert: item.minStock || 30,
    };
  }, [item]);

  if (isItemLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 py-4">
      {/* 1. Page Header (Breadcrumbs + Back Button) */}
      <ProductHeader
        product={product}
        onBack={() => router.back()}
      />

      {/* 2. Product Identity Hero Card */}
      <ProductIdentityCard
        product={product}
        onEdit={() => router.push(`/inventory/edit/${product.id}`)}
        onEditField={(field) => router.push(`/inventory/edit/${product.id}`)}
        onChangeImage={() => alert("Change image triggered")}
        onShare={() => alert("Share product triggered")}
        onArchive={() => alert("Archive product triggered")}
        onDelete={() => alert("Delete product triggered")}
      />

      {/* 3. Tabbed Navigation System */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <div className="overflow-x-auto pb-1">
          <TabsList className="bg-muted/60 p-1 rounded-2xl h-auto flex gap-1 w-max min-w-full sm:w-auto">
            <TabsTrigger
              value="overview"
              className="rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <Package className="h-3.5 w-3.5" />
              Overview
            </TabsTrigger>

            <TabsTrigger
              value="batches"
              className="rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <Layers className="h-3.5 w-3.5" />
              Batches ({mockBatches.length})
            </TabsTrigger>

            <TabsTrigger
              value="branches"
              className="rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <Store className="h-3.5 w-3.5" />
              Branches ({mockBranchStocks.length})
            </TabsTrigger>

            <TabsTrigger
              value="documents"
              className="rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <FileText className="h-3.5 w-3.5" />
              Documents
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content 1: Overview */}
        <TabsContent value="overview" className="space-y-6">
          <ProductInformationCard product={product} />
        </TabsContent>

        {/* Tab Content 2: Batches */}
        <TabsContent value="batches">
          <BatchTable
            batches={mockBatches}
            productId={product.id}
            onViewBatch={(bId) => alert(`View batch [${bId}]`)}
            onTransferStock={(bId) => alert(`Transfer batch stock [${bId}]`)}
            onAdjustStock={(bId) => alert(`Adjust batch stock [${bId}]`)}
          />
        </TabsContent>

        {/* Tab Content 3: Branches */}
        <TabsContent value="branches">
          <BranchStockTable branches={mockBranchStocks} />
        </TabsContent>

        {/* Tab Content 8: Documents */}
        <TabsContent value="documents">
          <Card className="border border-border/80 rounded-2xl bg-card shadow-sm p-8 text-center space-y-3">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-bold text-foreground">No Attachments Uploaded</h3>
            <p className="text-xs text-muted-foreground mx-auto">
              Upload product manuals, lab certificates, invoices, or compliance documents for safe keeping.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ProductDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ProductDetailsContent />
    </Suspense>
  );
}

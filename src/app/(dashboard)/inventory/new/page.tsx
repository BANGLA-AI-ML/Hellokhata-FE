"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  Receipt,
  ShieldCheck,
  Sparkles,
  Tag,
  UploadCloud,
} from "lucide-react";
import { useGetTaxCategories } from "@/hooks/api/useTaxCategories";
import { useGetUnits } from "@/hooks/api/useUnits";
import { useGetItemsCategories } from "@/hooks/api/useItemCategories";
import { useCreateItem } from "@/hooks/api/useItems";
import { useRouter } from "next/navigation";
import { useGetMasterItems } from "@/hooks/api/useMasterItems";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/uiStore";
import { BackButton } from "@/components/common";

export default function AddProductPage() {
  const router = useRouter();
  const { sidebarCollapsed } = useUiStore();

  // Form State matching API JSON schema
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [brand, setBrand] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [taxCategoryId, setTaxCategoryId] = useState<string | null>(null);
  const [unitId, setUnitId] = useState("");
  const [description, setDescription] = useState("");

  const [costPrice, setCostPrice] = useState<number | "">("");
  const [sellingPrice, setSellingPrice] = useState<number | "">("");
  const [wholesalePrice, setWholesalePrice] = useState<number | "">("");
  const [vipPrice, setVipPrice] = useState<number | "">("");
  const [minimumPrice, setMinimumPrice] = useState<number | "">("");

  const [currentStock, setCurrentStock] = useState<number | "">("");
  const [minStock, setMinStock] = useState<number | "">("");
  const [vatRate, setVatRate] = useState<number | "">(5);
  const [lowStockAlert, setLowStockAlert] = useState(false);

  const [trackExpiry, setTrackExpiry] = useState(false);
  const [trackBatch, setTrackBatch] = useState(false);
  const [status, setStatus] = useState("ACTIVE");
  const [warranty, setWarranty] = useState<"YES" | "NO">("NO");
  const [warrantyValue, setWarrantyValue] = useState<number | "">("");
  const [warrantyUnit, setWarrantyUnit] = useState<"DAYS" | "MONTHS" | "YEARS">("DAYS");
  const [productType, setProductType] = useState("PRODUCT");
  const [imageUrl, setImageUrl] = useState("");

  const calculateWarrantyDays = (val: number | "", unit: "DAYS" | "MONTHS" | "YEARS"): number => {
    if (val === "" || isNaN(Number(val))) return 0;
    const num = Number(val);
    if (unit === "YEARS") return num * 365;
    if (unit === "MONTHS") return num * 30;
    return num;
  };

  const [manufactureDate, setManufactureDate] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");

  const [showAdvancePricing, setShowAdvancePricing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // fetch api's and get tax categories, units and others 
  const { data: masterItemsData } = useGetMasterItems(name);
  const masterItems = masterItemsData?.items;
  const { data: taxCategories } = useGetTaxCategories();
  const { data: units } = useGetUnits();
  const { data: itemCategories } = useGetItemsCategories();
  const { mutate: saveProduct, isPending: isSaving } = useCreateItem();

  const handleSelectMasterItem = (item: any) => {
    if (!item) return;

    if (item.name) setName(item.name);
    // if (item.sku) setSku(item.sku);
    if (item.barcode) setBarcode(item.barcode);
    if (item.brand) setBrand(item.brand);
    if (item.description) setDescription(item.description);

    if (item.productType) {
      setProductType(item.productType);
    }
    if (item.image || item.imageUrl) {
      setImageUrl(item.image || item.imageUrl);
    }

    // Match Category
    if (item.category || item.categoryId) {
      const catVal = item.category || item.categoryId;
      const foundCategory = itemCategories?.find(
        (cat: any) =>
          cat.id === catVal ||
          cat.name?.toLowerCase() === (typeof catVal === "string" ? catVal : catVal?.name || "").toLowerCase()
      );
      if (foundCategory) {
        setCategoryId(foundCategory.id);
      } else if (typeof catVal === "string") {
        setCategoryId(catVal);
      }
    }

    // Match Unit
    if (item.unit || item.unitId) {
      const unitVal = item.unit || item.unitId;
      const foundUnit = units?.find(
        (u: any) =>
          u.id === unitVal ||
          u.symbol?.toLowerCase() === (typeof unitVal === "string" ? unitVal : unitVal?.name || "").toLowerCase()
      );
      if (foundUnit) {
        setUnitId(foundUnit.id);
      } else if (typeof unitVal === "string") {
        setUnitId(unitVal);
      }
    }

    // Clear validation errors for filled fields
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated.name;
      delete updated.unitId;
      delete updated.barcode;
      return updated;
    });

    setShowSuggestions(false);
  };
 

  const handleTrackBatchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setTrackBatch(isChecked);
    if (!isChecked) {
      setTrackExpiry(false);
    }
  };

  const generateSku = () => {
    const randomSku = `SKU-${Math.floor(100000 + Math.random() * 900000)}`;
    setSku(randomSku);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Product Name is required";
    }

    if (!unitId.trim()) {
      newErrors.unitId = "Unit Measure is required";
    }

    if (costPrice === "") {
      newErrors.costPrice = "Purchase Cost is required";
    }

    if (sellingPrice === "") {
      newErrors.sellingPrice = "Retail Selling Price is required";
    }



    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProduct = () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const formData = {
      name,
      sku,
      barcode,
      brand,
      categoryId,
      taxCategoryId,
      unitId,
      description,
      costPrice: costPrice === "" ? 0 : Number(costPrice),
      sellingPrice: sellingPrice === "" ? 0 : Number(sellingPrice),
      wholesalePrice: wholesalePrice === "" ? 0 : Number(wholesalePrice),
      vipPrice: vipPrice === "" ? 0 : Number(vipPrice),
      minimumPrice: minimumPrice === "" ? 0 : Number(minimumPrice),
      currentStock: currentStock === "" ? 0 : Number(currentStock),
      minStock: minStock === "" ? 0 : Number(minStock),
      vatRate: vatRate === "" ? 0 : Number(vatRate),
      lowStockAlert,
      trackExpiry,
      trackBatch,
      status,
      warrantyDays:
        warranty === "YES"
          ? calculateWarrantyDays(warrantyValue, warrantyUnit)
          : 0,
      productType,
      imageUrl,
      expiryDate: trackExpiry && expiryDate ? expiryDate : null,
      manufactureDate: trackExpiry && manufactureDate ? manufactureDate : null,
    };

    saveProduct(formData,{
      onSuccess:(data)=>{
      if(data.success){
        toast.success(data.message || "Product added successfully");
        console.log('inventory data', data)
        router.push("/inventory");
      }else{
        toast.error(data.message || "Failed to add product");
      }
    }
    })
    
  };

  // Dynamic calculation logic
  const cost = typeof costPrice === "number" ? costPrice : 0;
  const price = typeof sellingPrice === "number" ? sellingPrice : 0;

  const grossProfit = price - cost;
  const markupPercent =
    cost > 0 ? ((grossProfit / cost) * 100).toFixed(1) : "0.0";
  const marginPercent =
    price > 0 ? ((grossProfit / price) * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen text-foreground font-sans antialiased">
      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <main className="mx-auto space-y-4 sm:space-y-5 pb-24">
        {/* Header Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BackButton fallbackHref="/inventory" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Add New Product
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Initialize a new stock item, pricing, stock levels, and accounting
                settings.
              </p>
            </div>
          </div>
        </div>

        {/* Form Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* LEFT / MAIN COLUMN (2 cols wide) */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5">
            {/* CARD 1: Basic Product Information */}
            <section className="bg-zinc-900/20 border border-border rounded-xl px-5 py-4.5 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 pb-2.5 border-b border-border">
                <Boxes className="w-4 h-4 text-primary" />
                <h3 className="text-base font-semibold text-foreground">
                  Basic Product Information
                </h3>
              </div>

              <div className="space-y-3.5">
                {/* Prominent Product Name Field with Master Items Suggestion */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Product Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setShowSuggestions(true);
                      if (errors.name)
                        setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="e.g. Premium Jasmine Rice 5kg"
                    className={`w-full bg-background/50 border ${
                      errors.name ? "border-destructive" : "border-input"
                    } rounded-lg px-3.5 h-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all`}
                  />
                  {errors.name && (
                    <p className="text-destructive text-[11px] mt-1">
                      {errors.name}
                    </p>
                  )}

                  {/* Master Items Suggestion Dropdown */}
                  {showSuggestions && name.trim().length > 0 && Array.isArray(masterItems) && masterItems.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-card border border-border rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto backdrop-blur-md divide-y divide-border">
                      <div className="px-3 py-1.5 bg-muted/50 flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                        <span className="text-primary font-medium">Suggestions from Master Items</span>
                        <span>{masterItems.length} found</span>
                      </div>
                      {masterItems.map((item: any) => {
                        const categoryName =
                          typeof item.category === "object"
                            ? item.category?.name
                            : item.category ||
                              itemCategories?.find((c: any) => c.id === item.categoryId)?.name ||
                              "";
                        const unitName =
                          typeof item.unit === "object"
                            ? item.unit?.name
                            : item.unit ||
                              units?.find((u: any) => u.id === item.unitId)?.name ||
                              "";

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectMasterItem(item);
                            }}
                            className="w-full text-left p-3 hover:bg-muted/80 hover:border-l-2 hover:border-l-primary transition-all flex items-center justify-between gap-3 group cursor-pointer"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                {item.name} {item.nameBn ? `(${item.nameBn})` : ""}
                              </p>
                              <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground">
                                {categoryName && (
                                  <span className="px-1.5 py-0.5 rounded bg-muted text-foreground font-medium">
                                    {categoryName}
                                  </span>
                                )}
                                {unitName && <span>Unit: {unitName}</span>}
                                {item.barcode && <span>• Barcode: {item.barcode}</span>}
                                {item.sku && <span>• SKU: {item.sku}</span>}
                                {item.brand && <span>• Brand: {item.brand}</span>}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              {item.sellingPrice !== undefined && item.sellingPrice !== null && (
                                <div className="text-xs font-bold font-mono text-primary">
                                  ${Number(item.sellingPrice).toFixed(2)}
                                </div>
                              )}
                              {item.costPrice !== undefined && item.costPrice !== null && (
                                <div className="text-[10px] font-mono text-muted-foreground">
                                  Cost: ${Number(item.costPrice).toFixed(2)}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-foreground">
                        SKU Code
                      </label>
                      <button
                        type="button"
                        onClick={generateSku}
                        className="text-[11px] text-primary hover:underline font-medium"
                      >
                        Generate SKU
                      </button>
                    </div>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="e.g. JSM-RC-5KG"
                      className="w-full bg-background/50 border border-input rounded-lg px-3 h-10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-foreground">
                        Barcode
                      </label>
                    </div>
                    <input
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="e.g. 8901030700812"
                      className="w-full bg-background/50 border border-input rounded-lg px-3 h-10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-foreground">
                        Category
                      </label>
                      <button className="text-[11px] text-primary hover:underline font-medium">
                        + Add
                      </button>
                    </div>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-background/50 border border-input rounded-lg px-2.5 h-10 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                    >
                      <option value="">Select Category</option>
                      {itemCategories?.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-foreground">
                        Brand
                      </label>
                      <button className="text-[11px] text-primary hover:underline font-medium">
                        + Add
                      </button>
                    </div>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Royal Harvest"
                      className="w-full bg-background/50 border border-input rounded-lg px-3 h-10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Unit Measure <span className="text-primary">*</span>
                    </label>
                    <select
                      value={unitId}
                      onChange={(e) => {
                        setUnitId(e.target.value);
                        if (errors.unitId)
                          setErrors((prev) => ({ ...prev, unitId: "" }));
                      }}
                      className={`w-full bg-background/50 border ${
                        errors.unitId ? "border-destructive" : "border-input"
                      } rounded-lg px-2.5 h-10 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all`}
                    >
                      <option value="">Select Unit</option>
                      {units?.map((u: any) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                    {errors.unitId && (
                      <p className="text-destructive text-[11px] mt-1">
                        {errors.unitId}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Product Type
                    </label>
                    <select
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                      className="w-full bg-background/50 border border-input rounded-lg px-2.5 h-10 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                    >
                      <option value="PRODUCT">Physical Product</option>
                      <option value="DIGITAL">Digital Product</option>
                      <option value="SERVICE">Service</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Initial Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-background/50 border border-input rounded-lg px-2.5 h-10 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>

                  {/* Warranty Dropdown Field */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Warranty
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={warranty}
                        onChange={(e) =>
                          setWarranty(e.target.value as "YES" | "NO")
                        }
                        className={cn(
                          "bg-background/50 border border-input rounded-lg px-2.5 h-10 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all",
                          warranty === "YES" ? "w-24 shrink-0" : "w-full"
                        )}
                      >
                        <option value="NO">No</option>
                        <option value="YES">Yes</option>
                      </select>

                      {warranty === "YES" && (
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <input
                            type="number"
                            min="0"
                            value={warrantyValue}
                            onChange={(e) =>
                              setWarrantyValue(
                                e.target.value === ""
                                  ? ""
                                  : Math.max(0, Number(e.target.value))
                              )
                            }
                            placeholder="1"
                            className="w-full bg-background/50 border border-input rounded-lg px-2.5 h-10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono min-w-0"
                          />
                          <select
                            value={warrantyUnit}
                            onChange={(e) =>
                              setWarrantyUnit(
                                e.target.value as "DAYS" | "MONTHS" | "YEARS"
                              )
                            }
                            className="bg-background/50 border border-input rounded-lg px-2.5 h-10 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all shrink-0 cursor-pointer"
                          >
                            <option value="DAYS">Days</option>
                            <option value="MONTHS">Months</option>
                            <option value="YEARS">Years</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Batch & Expiry Tracking + Dates Row */}
                <div className="">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-end py-3">
                    {/* Batch Tracking */}
                    <div className="flex items-center h-10">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={trackBatch}
                          onChange={handleTrackBatchChange}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-muted border border-input peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-foreground after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-foreground after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary relative"></div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-foreground font-medium block">
                              Batch Tracking
                            </span>
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md">
                              <Sparkles className="w-2.5 h-2.5" />
                              PRO
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground block leading-tight">
                            Assign lot numbers on receipt
                          </span>
                        </div>
                      </label>
                    </div>

                    {/* Expiry Tracking */}
                    <div className="flex items-center h-10">
                      <label
                        className={`flex items-center gap-2.5 select-none ${
                          !trackBatch
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={trackExpiry}
                          onChange={(e) => setTrackExpiry(e.target.checked)}
                          disabled={!trackBatch}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-muted border border-input peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-foreground after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-foreground after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary relative peer-disabled:opacity-50"></div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-foreground font-medium block">
                              Expiry Tracking
                            </span>
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md">
                              <Sparkles className="w-2.5 h-2.5" />
                              PRO
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground block leading-tight">
                            Monitor expiration dates
                          </span>
                        </div>
                      </label>
                    </div>

                    {/* Manufacture Date */}
                    {trackExpiry ? (
                      <div className="animate-in fade-in duration-200">
                        <label className="block text-xs font-medium text-foreground mb-1">
                          Manufacture Date
                        </label>
                        <input
                          type="date"
                          value={manufactureDate}
                          onChange={(e) => {
                            setManufactureDate(e.target.value);
                            if (errors.manufactureDate)
                              setErrors((prev) => ({
                                ...prev,
                                manufactureDate: "",
                              }));
                          }}
                          className={`w-full bg-background/50 border ${
                            errors.manufactureDate
                              ? "border-destructive"
                              : "border-input"
                          } rounded-lg px-3 h-10 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono`}
                        />
                        {errors.manufactureDate && (
                          <p className="text-destructive text-[11px] mt-1">
                            {errors.manufactureDate}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="hidden lg:block" />
                    )}

                    {/* Expiry Date */}
                    {trackExpiry ? (
                      <div className="animate-in fade-in duration-200">
                        <label className="block text-xs font-medium text-foreground mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="date"
                          value={expiryDate}
                          onChange={(e) => {
                            setExpiryDate(e.target.value);
                            if (errors.expiryDate)
                              setErrors((prev) => ({
                                ...prev,
                                expiryDate: "",
                              }));
                          }}
                          className={`w-full bg-background/50 border ${
                            errors.expiryDate
                              ? "border-destructive"
                              : "border-input"
                          } rounded-lg px-3 h-10 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono`}
                        />
                        {errors.expiryDate && (
                          <p className="text-destructive text-[11px] mt-1">
                            {errors.expiryDate}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="hidden lg:block" />
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* CARD 2: Pricing & Profit Margins */}
            <section className="bg-zinc-900/20 border border-border rounded-xl px-5 py-4.5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="w-4 h-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">
                    Pricing & Profit Margins
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                {/* Left Column: Core Inputs & Expandable Advance Inputs */}
                <div className="md:col-span-2 space-y-3.5">
                  {/* Base Pricing Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">
                        Purchase Cost <span className="text-primary">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono">
                          $
                        </span>
                        <input
                          type="number"
                          value={costPrice}
                          onChange={(e) => {
                            setCostPrice(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                            );
                            if (errors.costPrice)
                              setErrors((prev) => ({ ...prev, costPrice: "" }));
                          }}
                          placeholder="0.00"
                          className={`w-full bg-background/50 border ${
                            errors.costPrice
                              ? "border-destructive"
                              : "border-input"
                          } rounded-lg pl-7 pr-3 h-10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono`}
                        />
                      </div>
                      {errors.costPrice && (
                        <p className="text-destructive text-[11px] mt-1">
                          {errors.costPrice}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">
                        Retail Selling Price (MRP){" "}
                        <span className="text-primary">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono">
                          $
                        </span>
                        <input
                          type="number"
                          value={sellingPrice}
                          onChange={(e) => {
                            setSellingPrice(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                            );
                            if (errors.sellingPrice)
                              setErrors((prev) => ({
                                ...prev,
                                sellingPrice: "",
                              }));
                          }}
                          placeholder="0.00"
                          className={`w-full bg-background/50 border ${
                            errors.sellingPrice
                              ? "border-destructive"
                              : "border-input"
                          } rounded-lg pl-7 pr-3 h-10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono`}
                        />
                      </div>
                      {errors.sellingPrice && (
                        <p className="text-destructive text-[11px] mt-1">
                          {errors.sellingPrice}
                        </p>
                      )}
                    </div>
                      <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Tax Category
                  </label>
                  <select
                    value={taxCategoryId || ""}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setTaxCategoryId(selectedId || null);
                      const selected = taxCategories?.find(
                        (tc: any) => tc.id === selectedId,
                      );
                      if (selected && typeof selected.rate === "number") {
                        setVatRate(selected.rate);
                      }
                    }}
                    className="w-full bg-background/50 border border-input rounded-lg px-2.5 h-10 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                  >
                    <option value="">Select Tax Category</option>
                    {taxCategories?.map((tc: any) => (
                      <option key={tc.id} value={tc.id}>
                        {tc.name} {tc.rate}%
                      </option>
                    ))}
                  </select>
                </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAdvancePricing((prev) => !prev)}
                    className="text-xs text-primary hover:underline font-medium flex items-center gap-1 transition-all"
                  >
                    {showAdvancePricing
                      ? "– Hide Advance Pricing"
                      : "+ Advance Pricing"}
                  </button>
                  {/* Conditionally Expanded Advance Pricing Inputs */}
                  {showAdvancePricing && (
                    <div className="pt-2 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-3.5 animate-in fade-in duration-200">
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">
                          Wholesale Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono">
                            $
                          </span>
                          <input
                            type="number"
                            value={wholesalePrice}
                            onChange={(e) =>
                              setWholesalePrice(
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                              )
                            }
                            placeholder="0.00"
                            className="w-full bg-background/50 border border-input rounded-lg pl-7 pr-3 h-10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">
                          VIP Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono">
                            $
                          </span>
                          <input
                            type="number"
                            value={vipPrice}
                            onChange={(e) =>
                              setVipPrice(
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                              )
                            }
                            placeholder="0.00"
                            className="w-full bg-background/50 border border-input rounded-lg pl-7 pr-3 h-10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">
                          Min Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono">
                            $
                          </span>
                          <input
                            type="number"
                            value={minimumPrice}
                            onChange={(e) =>
                              setMinimumPrice(
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                              )
                            }
                            placeholder="0.00"
                            className="w-full bg-background/50 border border-input rounded-lg pl-7 pr-3 h-10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dynamic Calculation Sidebar Box */}
                <div className="bg-background/40 border border-border/60 rounded-lg p-3 flex flex-col justify-between space-y-1.5 self-stretch">
                  <div className="flex items-center justify-between text-xs pb-1 border-b border-border">
                    <span className="text-muted-foreground font-medium">
                      Profit & Margin
                    </span>
                    <span className="text-primary font-mono text-[11px]">
                      %
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Gross Profit / Unit:
                      </span>
                      <span className="font-mono text-foreground">
                        ${grossProfit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Markup %:</span>
                      <span className="font-mono text-primary">
                        {markupPercent}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profit Margin %:</span>
                      <span className="font-mono text-primary">
                        {marginPercent}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CARD 3: Inventory Stock Levels */}
            <section className="bg-zinc-900/20 border border-border rounded-xl px-5 py-4.5 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 pb-2.5 border-b border-border">
                <Boxes className="w-4 h-4 text-primary" />
                <h3 className="text-base font-semibold text-foreground">
                  Inventory Stock Levels
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Opening Stock
                    </label>
                    <input
                      type="number"
                      value={currentStock}
                      onChange={(e) =>
                        setCurrentStock(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      placeholder="0"
                      className="w-full bg-background/50 border border-input rounded-lg px-3 h-10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Min Stock Alert
                    </label>
                    <input
                      type="number"
                      value={minStock}
                      onChange={(e) =>
                        setMinStock(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      placeholder="0"
                      className="w-full bg-background/50 border border-input rounded-lg px-3 h-10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={lowStockAlert}
                        onChange={(e) => setLowStockAlert(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-muted border border-input peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-foreground after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-foreground after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary relative"></div>
                      <div>
                        <span className="text-xs text-foreground font-medium block">
                          Low Stock Alert
                        </span>
                        <span className="text-[10px] text-muted-foreground block leading-tight">
                          Notify when stock is below minimum
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Summary Breakdown Box */}
                <div className="bg-background/40 border border-border/60 rounded-lg p-3 flex flex-col justify-between space-y-1.5">
                  <span className="text-xs text-muted-foreground font-medium block pb-1 border-b border-border">
                    Stock Summary
                  </span>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Opening Balance:</span>
                      <span className="font-mono text-foreground">
                        {currentStock || 0} pcs
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min Alert Level:</span>
                      <span className="font-mono text-amber-500 dark:text-amber-400">
                        {minStock || 0} pcs
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

         
          </div>

          {/* RIGHT COLUMN SIDEBAR CARDS - STICKY WRAPPER */}
          <div className="space-y-4 sm:space-y-5 lg:sticky lg:top-6">
            {/* Product Media Dropzone Card */}
            <section className="bg-zinc-900/20 border border-border rounded-xl p-4.5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <UploadCloud className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  Product Media
                </h3>
              </div>

              <div className="border-2 border-dashed border-input hover:border-primary/60 rounded-lg p-15 text-center transition-colors cursor-pointer bg-background/30 hover:bg-background/50 group">
                <div className="w-18 h-18 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <p className="text-xs text-foreground font-medium mt-1.5">
                  Drag & drop image here, or{" "}
                  <span className="text-primary underline font-medium">
                    browse
                  </span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  PNG, JPG up to 10MB
                </p>
              </div>
            </section>

            {/* Creation Summary Card */}
            {/* <section className="bg-zinc-900/20 border border-border rounded-xl p-4.5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  Creation Summary
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Created By:</span>
                  <span className="font-medium text-foreground">Admin_MGR</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Tax Class:</span>
                  <span className="font-medium text-foreground">
                    Standard (5%)
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">System Status:</span>
                  <span className="inline-flex items-center gap-1.5 text-primary font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Validating Entry
                  </span>
                </div>
              </div>
            </section> */}
               {/* CARD 5: Description Section */}
            <section className="bg-zinc-900/20 border border-border rounded-xl px-5 py-4.5 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 pb-2.5 border-b border-border">
                <Tag className="w-4 h-4 text-primary" />
                <h3 className="text-base font-semibold text-foreground">
                  Description
                </h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter full product details, specifications, packaging notes, tags, or internal metadata..."
                  className="w-full bg-background/50 border border-input rounded-lg px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                />
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* ================= FIXED BOTTOM ACTION BAR ================= */}
      <footer
        className={cn(
          "fixed bottom-0 right-0 h-20 bg-background/95 backdrop-blur border-t border-border flex items-center justify-between px-4 sm:px-6 z-30 shadow-lg transition-all duration-300 ease-smooth",
          "left-0 md:left-64",
          sidebarCollapsed && "md:left-16"
        )}
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
          <span className="hidden sm:inline">
            Ready to register item into inventory master data
          </span>
          <span className="sm:hidden">Ready to submit</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveProduct}
            className="px-8 py-4 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-all shadow-sm shadow-primary/20 cursor-pointer"
          >
            Save Product
          </button>
        </div>
      </footer>
    </div>
  );
}

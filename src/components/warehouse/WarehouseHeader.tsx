"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Plus,
  Edit,
  ArrowRightLeft,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Wrench,
  MoreVertical,
  Upload,
  Download,
  MapPin,
  Clock,
  Star,
  Settings,
} from "lucide-react";
import { Warehouse, MOCK_BRANCHES } from "./WarehouseMockData";

interface WarehouseHeaderProps {
  warehouses: Warehouse[];
  selectedWarehouse: Warehouse | null;
  selectedBranchId: string;
  onSelectBranch: (branchId: string) => void;
  onSelectWarehouse: (warehouse: Warehouse | null) => void;
  onOpenNewModal: () => void;
  onOpenEditModal: (warehouse: Warehouse) => void;
  onNavigateTransfer: () => void;
  onExportCsv?: () => void;
  onImportModal?: () => void;
  isBangla?: boolean;
}

export function WarehouseHeader({
  warehouses,
  selectedWarehouse,
  selectedBranchId,
  onOpenNewModal,
  onOpenEditModal,
  onNavigateTransfer,
  onExportCsv,
  onImportModal,
  isBangla = false,
}: WarehouseHeaderProps) {
  const currentWh = selectedWarehouse || (warehouses?.length > 0 ? warehouses[0] : null);


  return (
    <div className="">
      <div className="flex flex-col md:flex-row md:items-center justify-end gap-3">
       

        {/* Right Section: Primary Action + Overflow Menu */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Primary Action ONLY: New Warehouse */}
          <Button
            type="button"
            onClick={onOpenNewModal}
            className="h-8.5 text-xs font-bold gap-1.5 cursor-pointer shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{isBangla ? "নতুন ওয়্যারহাউস" : "New Warehouse"}</span>
          </Button>

          {/* Overflow Menu Dropdown (Includes Edit, Transfer, Import, Export) */}
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8.5 w-8.5 border-border/80 cursor-pointer">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-card border-border shadow-xl">
              {currentWh && (
                <DropdownMenuItem
                  onClick={() => onOpenEditModal(currentWh)}
                  className="text-xs font-semibold gap-2 cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5 text-primary" />
                  <span>{isBangla ? "ওয়্যারহাউস এডিট করুন" : "Edit Warehouse"}</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={onNavigateTransfer}
                className="text-xs font-semibold gap-2 cursor-pointer"
              >
                <ArrowRightLeft className="h-3.5 w-3.5 text-blue-500" />
                <span>{isBangla ? "স্টক ট্রান্সফার করুন" : "Transfer Stock"}</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {onImportModal && (
                <DropdownMenuItem
                  onClick={onImportModal}
                  className="text-xs gap-2 cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5 text-emerald-500" />
                  <span>{isBangla ? "ওয়্যারহাউস ইম্পোর্ট (CSV)" : "Import Warehouses"}</span>
                </DropdownMenuItem>
              )}

              {onExportCsv && (
                <DropdownMenuItem
                  onClick={onExportCsv}
                  className="text-xs gap-2 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-amber-500" />
                  <span>{isBangla ? "ওয়্যারহাউস এক্সপোর্ট (CSV)" : "Export Warehouses"}</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>
      </div>
    </div>
  );
}

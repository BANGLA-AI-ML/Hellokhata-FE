// Hello Khata OS - Enterprise User Access & Custom Permissions Suite
// হ্যালো খাতা - ব্যবহারকারী প্রবেশাধিকার, শাখা সীমাবদ্ধতা ও কাস্টম অনুমতি প্ল্যাটফর্ম

'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Plus,
  Users,
  Save,
  Lock,
  Copy,
  Crown,
  Building2,
  Warehouse,
  UserCog,
  LayoutGrid,
  Settings,
  Check,
  KeyRound,
  Trash2,
  Edit2,
  Search,
  Sliders,
  Sparkles,
  ArrowRight,
  Shield,
  Coins,
  ShoppingCart,
  Truck,
  Package,
  Landmark,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  UserPlus,
  UserX,
  Eye,
  EyeOff,
  Percent,
  Banknote,
  Calendar,
  Layers,
  FileText,
  ChevronDown,
  ChevronRight,
  Filter,
  CheckSquare,
  Square,
  MinusSquare,
  ExternalLink,
  ShieldAlert,
  ArrowLeft,
  X,
  RefreshCw,
  Clock,
  Briefcase,
  SlidersHorizontal,
  ChevronUp,
  MapPin,
  Globe,
  Database,
  Info,
  BadgeCheck,
  AlertOctagon,
  Unlock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useAppTranslation, useCurrency } from '@/hooks/useAppTranslation';
import { HRM_BRANCHES, HRM_EMPLOYEES } from '@/components/hrm/mock-data';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ─── TYPES & DATA STRUCTURES ─────────────────────────────────────────────────

export type AccessLevelType = 'full_system' | 'branch_restricted' | 'custom_access' | 'restricted' | 'unassigned';
export type DataScopeType = 'entire_business' | 'assigned_branches' | 'own_department' | 'own_records';
export type PermissionLevelType = 'no_access' | 'read_only' | 'standard' | 'full_access' | 'custom';

export interface PermissionAction {
  id: string;
  code: string;
  name: string;
  nameBn: string;
  description: string;
  category: string; // 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'special'
  isSensitive?: boolean;
  dependsOn?: string[]; // IDs of permissions required for this to work
}

export interface ERPModuleDefinition {
  id: string;
  code: string;
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
  iconName: string;
  permissions: PermissionAction[];
  standardPermissionIds: string[];
  readOnlyPermissionIds: string[];
}

export interface UserAccessProfile {
  id: string;
  userId: string;
  employeeId: string;
  name: string;
  nameBn: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  avatarUrl?: string;
  status: 'active' | 'inactive';
  isOwner?: boolean;
  isFullSystemAccess: boolean;
  baseRoleId: string;
  accessLevel: AccessLevelType;
  branchScopeMode: 'all' | 'selected';
  allowedBranchIds: string[];
  dataScope: DataScopeType;
  customGrantedPermissions: string[]; // Overrides: user has these even if role doesn't
  customRevokedPermissions: string[]; // Overrides: user does NOT have these even if role does
  lastActive?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface BaseRoleDefinition {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
  isSystemProtected: boolean;
  color: string;
  defaultDataScope: DataScopeType;
  defaultBranchMode: 'all' | 'selected';
  permissionIds: string[];
}

export interface AccessAuditEntry {
  id: string;
  timestamp: string;
  performedBy: string;
  targetUserName: string;
  targetUserRole: string;
  actionType: 'permission_override' | 'role_changed' | 'branch_scope_updated' | 'full_access_granted' | 'full_access_revoked' | 'user_created' | 'status_changed';
  addedPermissions: string[];
  removedPermissions: string[];
  branchChanges?: { added: string[]; removed: string[] };
  notes: string;
}

// ─── COMPLETE ERP MODULE PERMISSION REGISTRY (10 CORE MODULES) ───────────────

export const ERP_MODULES: ERPModuleDefinition[] = [
  {
    id: 'mod_dashboard',
    code: 'DASHBOARD',
    name: 'Dashboard & Analytics',
    nameBn: 'ড্যাশবোর্ড ও বিশ্লেষণ',
    description: 'Executive KPIs, revenue metrics, branch performance, and business insights.',
    descriptionBn: 'ব্যবসায়িক কেপিআই, রাজস্ব পরিমাপ, শাখা কর্মক্ষমতা এবং গুরুত্বপূর্ণ পরিসংখ্যান।',
    iconName: 'LayoutGrid',
    readOnlyPermissionIds: ['dash_view_overview', 'dash_view_branch_kpi'],
    standardPermissionIds: ['dash_view_overview', 'dash_view_branch_kpi', 'dash_export_kpi'],
    permissions: [
      { id: 'dash_view_overview', code: 'DASH_VIEW_OVERVIEW', name: 'View Dashboard', nameBn: 'ড্যাশবোর্ড দেখুন', description: 'Access standard dashboard charts & summaries', category: 'view' },
      { id: 'dash_view_summary', code: 'DASH_VIEW_SUMMARY', name: 'View Business Summary', nameBn: 'ব্যবসায়িক সারাংশ দেখুন', description: 'View net profit, margins, and sales revenue', category: 'view', isSensitive: true },
      { id: 'dash_view_branch_kpi', code: 'DASH_VIEW_BRANCH_KPI', name: 'View Branch Analytics', nameBn: 'শাখার অ্যানালিটিক্স দেখুন', description: 'Compare multi-branch performance metrics', category: 'view' },
      { id: 'dash_export_kpi', code: 'DASH_EXPORT_KPI', name: 'Export Dashboard Data', nameBn: 'ড্যাশবোর্ড ডেটা এক্সপোর্ট', description: 'Export visual reports as PDF or spreadsheet', category: 'export' },
    ],
  },
  {
    id: 'mod_sales',
    code: 'SALES_POS',
    name: 'Sales & POS',
    nameBn: 'বিক্রয় ও পিওএস',
    description: 'Point of Sale, invoices, billing, cash registers, returns, and quotations.',
    descriptionBn: 'পিওএস কাউন্টার বিলিং, ইনভয়েস তৈরি, ক্যাশ রেজিস্টার ও রিটার্ন ব্যবস্থাপনা।',
    iconName: 'ShoppingCart',
    readOnlyPermissionIds: ['sales_view', 'sales_view_history'],
    standardPermissionIds: ['sales_view', 'sales_create', 'sales_edit', 'sales_process_return', 'sales_view_history'],
    permissions: [
      { id: 'sales_view', code: 'SALES_VIEW', name: 'View Sales', nameBn: 'বিক্রয় তালিকা দেখুন', description: 'View sales invoices, receipts, and order logs', category: 'view' },
      { id: 'sales_create', code: 'SALES_CREATE', name: 'Create Sale / POS Billing', nameBn: 'নতুন বিক্রয় তৈরি করুন', description: 'Generate POS receipts and standard sales orders', category: 'create', dependsOn: ['sales_view'] },
      { id: 'sales_edit', code: 'SALES_EDIT', name: 'Edit Sale Invoices', nameBn: 'বিক্রয় ইনভয়েস সম্পাদনা', description: 'Modify line items, quantities, or customer details', category: 'edit', dependsOn: ['sales_view'] },
      { id: 'sales_delete', code: 'SALES_DELETE', name: 'Delete / Void Sale', nameBn: 'বিক্রয় বাতিল বা মুছে ফেলুন', description: 'Cancel existing sale invoices and reverse ledger', category: 'delete', isSensitive: true, dependsOn: ['sales_view'] },
      { id: 'sales_apply_discount', code: 'SALES_APPLY_DISCOUNT', name: 'Apply Discounts', nameBn: 'ডিসকাউন্ট প্রয়োগ করুন', description: 'Grant custom discounts at POS checkout', category: 'special' },
      { id: 'sales_price_override', code: 'SALES_PRICE_OVERRIDE', name: 'Override Unit Prices', nameBn: 'মূল্য পরিবর্তন করুন', description: 'Manually alter selling prices from retail default', category: 'special', isSensitive: true },
      { id: 'sales_process_return', code: 'SALES_PROCESS_RETURN', name: 'Process Sales Returns', nameBn: 'বিক্রয় রিটার্ন প্রসেস', description: 'Accept customer product returns and issue refunds', category: 'edit', dependsOn: ['sales_view'] },
      { id: 'sales_view_history', code: 'SALES_VIEW_HISTORY', name: 'View Sales History', nameBn: 'বিক্রয় ইতিহাস দেখুন', description: 'Inspect audit trail of modified orders', category: 'view' },
      { id: 'sales_export', code: 'SALES_EXPORT', name: 'Export Sales Data', nameBn: 'বিক্রয় ডেটা এক্সপোর্ট', description: 'Download CSV and Excel files of all sales invoices', category: 'export', dependsOn: ['sales_view'] },
      { id: 'sales_manage_pos', code: 'SALES_MANAGE_POS', name: 'Manage POS Register', nameBn: 'পিওএস ক্যাশ ড্রয়ার নিয়ন্ত্রণ', description: 'Open/close day register, cash-in, and cash-out', category: 'special' },
    ],
  },
  {
    id: 'mod_purchases',
    code: 'PURCHASES',
    name: 'Purchases & Suppliers',
    nameBn: 'ক্রয় ও সরবরাহকারী',
    description: 'Supplier orders, goods received notes (GRN), purchase returns, and payables.',
    descriptionBn: 'সরবরাহকারী ক্রয় আদেশ, পণ্য গ্রহণ (GRN), ক্রয় রিটার্ন এবং বকেয়া বিল।',
    iconName: 'Truck',
    readOnlyPermissionIds: ['pur_view', 'pur_view_history'],
    standardPermissionIds: ['pur_view', 'pur_create', 'pur_edit', 'pur_process_return', 'pur_view_history'],
    permissions: [
      { id: 'pur_view', code: 'PUR_VIEW', name: 'View Purchases', nameBn: 'ক্রয় তালিকা দেখুন', description: 'Inspect all purchase orders and vendor bills', category: 'view' },
      { id: 'pur_create', code: 'PUR_CREATE', name: 'Create Purchase Order', nameBn: 'নতুন ক্রয় আদেশ তৈরি', description: 'Issue POs and record goods received into stock', category: 'create', dependsOn: ['pur_view'] },
      { id: 'pur_edit', code: 'PUR_EDIT', name: 'Edit Purchase Invoices', nameBn: 'ক্রয় বিল সম্পাদনা', description: 'Update supplier bills, unit costs, and tax entries', category: 'edit', dependsOn: ['pur_view'] },
      { id: 'pur_delete', code: 'PUR_DELETE', name: 'Delete Purchase Records', nameBn: 'ক্রয় রেকর্ড মুছে ফেলুন', description: 'Remove purchase orders and reverse supplier credits', category: 'delete', isSensitive: true, dependsOn: ['pur_view'] },
      { id: 'pur_approve', code: 'PUR_APPROVE', name: 'Approve High-Value POs', nameBn: 'উচ্চ মূল্যের ক্রয় অনুমোদন', description: 'Authorize purchasing orders above preset limits', category: 'approve', isSensitive: true, dependsOn: ['pur_view'] },
      { id: 'pur_process_return', code: 'PUR_PROCESS_RETURN', name: 'Process Purchase Returns', nameBn: 'ক্রয় রিটার্ন প্রসেস', description: 'Return damaged or surplus items to vendor', category: 'edit', dependsOn: ['pur_view'] },
      { id: 'pur_view_history', code: 'PUR_VIEW_HISTORY', name: 'View Purchase History', nameBn: 'ক্রয় ইতিহাস দেখুন', description: 'View cost revision audit logs', category: 'view' },
      { id: 'pur_export', code: 'PUR_EXPORT', name: 'Export Purchase Data', nameBn: 'ক্রয় ডেটা এক্সপোর্ট', description: 'Export purchase bills and supplier ledgers', category: 'export', dependsOn: ['pur_view'] },
    ],
  },
  {
    id: 'mod_inventory',
    code: 'INVENTORY',
    name: 'Inventory & Warehouses',
    nameBn: 'ইনভেন্টরি ও ওয়্যারহাউস',
    description: 'Stock tracking, batches, FEFO expiry alerts, warehouse transfers, and adjustments.',
    descriptionBn: 'স্টক ট্র্যাকিং, ব্যাচ ও মেয়াদোত্তীর্ণ সতর্কতা, গুদাম স্থানান্তর ও সমন্বয়।',
    iconName: 'Package',
    readOnlyPermissionIds: ['inv_view', 'inv_view_alerts', 'inv_view_history'],
    standardPermissionIds: ['inv_view', 'inv_add_products', 'inv_edit_products', 'inv_transfer_stock', 'inv_view_alerts', 'inv_batches'],
    permissions: [
      { id: 'inv_view', code: 'INV_VIEW', name: 'View Inventory', nameBn: 'ইনভেন্টরি দেখুন', description: 'View item catalogue, stock counts, and valuation', category: 'view' },
      { id: 'inv_add_products', code: 'INV_ADD_PRODUCTS', name: 'Add Products', nameBn: 'নতুন পণ্য যোগ করুন', description: 'Create new SKU, barcodes, categories, and brands', category: 'create', dependsOn: ['inv_view'] },
      { id: 'inv_edit_products', code: 'INV_EDIT_PRODUCTS', name: 'Edit Products', nameBn: 'পণ্য সম্পাদনা করুন', description: 'Update product prices, specs, and reorder levels', category: 'edit', dependsOn: ['inv_view'] },
      { id: 'inv_delete_products', code: 'INV_DELETE_PRODUCTS', name: 'Delete Products', nameBn: 'পণ্য মুছে ফেলুন', description: 'Permanently remove inactive or obsolete items', category: 'delete', isSensitive: true, dependsOn: ['inv_view'] },
      { id: 'inv_adjust_stock', code: 'INV_ADJUST_STOCK', name: 'Adjust Stock / Write-Offs', nameBn: 'স্টক সমন্বয় ও অবচয়', description: 'Manually modify stock counts due to damage/theft', category: 'special', isSensitive: true, dependsOn: ['inv_view'] },
      { id: 'inv_transfer_stock', code: 'INV_TRANSFER_STOCK', name: 'Transfer Between Branches', nameBn: 'শাখা/গুদাম স্থানান্তর', description: 'Dispatch and receive internal stock transfer notes', category: 'edit', dependsOn: ['inv_view'] },
      { id: 'inv_manage_warehouses', code: 'INV_MANAGE_WAREHOUSES', name: 'Manage Warehouses & Racks', nameBn: 'ওয়্যারহাউস ব্যবস্থাপনা', description: 'Create and configure warehouse storage locations', category: 'special', isSensitive: true },
      { id: 'inv_view_alerts', code: 'INV_VIEW_ALERTS', name: 'View Low Stock & Expiry', nameBn: 'স্বল্প স্টক ও মেয়াদ সতর্কতা', description: 'Inspect real-time FEFO alerts and replenishment needs', category: 'view' },
      { id: 'inv_batches', code: 'INV_BATCHES', name: 'Manage Batches & Expiry', nameBn: 'ব্যাচ ও মেয়াদ পরিচালনা', description: 'Assign batch numbers, manufacturing dates, and lot tags', category: 'edit', dependsOn: ['inv_view'] },
      { id: 'inv_export', code: 'INV_EXPORT', name: 'Export Stock Reports', nameBn: 'স্টক রিপোর্ট এক্সপোর্ট', description: 'Export full stock ledger and valuation sheets', category: 'export', dependsOn: ['inv_view'] },
    ],
  },
  {
    id: 'mod_parties',
    code: 'PARTIES',
    name: 'Parties (Customers & Suppliers)',
    nameBn: 'পার্টি (গ্রাহক ও সরবরাহকারী)',
    description: 'CRM contacts, credit limits, khata ledgers, party balance statements, and phonebook.',
    descriptionBn: 'গ্রাহক ও সরবরাহকারী খাতা, বাকির সীমা, কন্টাক্ট ডিরেক্টরি এবং লেনদেন হিসেব।',
    iconName: 'Users',
    readOnlyPermissionIds: ['party_view_customers', 'party_view_suppliers', 'party_view_transactions'],
    standardPermissionIds: ['party_view_customers', 'party_view_suppliers', 'party_create_customer', 'party_edit_customer', 'party_create_supplier', 'party_view_transactions'],
    permissions: [
      { id: 'party_view_customers', code: 'PARTY_VIEW_CUSTOMERS', name: 'View Customers', nameBn: 'গ্রাহক তালিকা দেখুন', description: 'Access customer profiles and transaction totals', category: 'view' },
      { id: 'party_create_customer', code: 'PARTY_CREATE_CUSTOMER', name: 'Create Customer', nameBn: 'নতুন গ্রাহক তৈরি', description: 'Register new customers into the company ledger', category: 'create' },
      { id: 'party_edit_customer', code: 'PARTY_EDIT_CUSTOMER', name: 'Edit Customer', nameBn: 'গ্রাহক তথ্য সম্পাদনা', description: 'Update customer phone, address, and credit settings', category: 'edit', dependsOn: ['party_view_customers'] },
      { id: 'party_delete_customer', code: 'PARTY_DELETE_CUSTOMER', name: 'Delete Customer', nameBn: 'গ্রাহক মুছে ফেলুন', description: 'Remove customer accounts with zero balance', category: 'delete', isSensitive: true, dependsOn: ['party_view_customers'] },
      { id: 'party_view_suppliers', code: 'PARTY_VIEW_SUPPLIERS', name: 'View Suppliers', nameBn: 'সরবরাহকারী দেখুন', description: 'Inspect vendor list and payable ledger balances', category: 'view' },
      { id: 'party_create_supplier', code: 'PARTY_CREATE_SUPPLIER', name: 'Create Supplier', nameBn: 'নতুন সরবরাহকারী যোগ', description: 'Add new supplier company details and contacts', category: 'create' },
      { id: 'party_edit_supplier', code: 'PARTY_EDIT_SUPPLIER', name: 'Edit Supplier', nameBn: 'সরবরাহকারী সম্পাদনা', description: 'Modify vendor terms and payment addresses', category: 'edit', dependsOn: ['party_view_suppliers'] },
      { id: 'party_delete_supplier', code: 'PARTY_DELETE_SUPPLIER', name: 'Delete Supplier', nameBn: 'সরবরাহকারী মুছে ফেলুন', description: 'Remove vendor accounts from the system', category: 'delete', isSensitive: true, dependsOn: ['party_view_suppliers'] },
      { id: 'party_manage_credit_limits', code: 'PARTY_MANAGE_CREDIT_LIMITS', name: 'Manage Credit Limits', nameBn: 'বাকির সীমা (Credit Limit) নির্ধারণ', description: 'Set max allowed due amount for specific buyers', category: 'special', isSensitive: true },
      { id: 'party_view_transactions', code: 'PARTY_VIEW_TRANSACTIONS', name: 'View Party Ledgers', nameBn: 'পার্টি লেজার ও লেনদেন হিসেব', description: 'Review detailed chronological Khata balances', category: 'view' },
      { id: 'party_export', code: 'PARTY_EXPORT', name: 'Export Party Ledgers', nameBn: 'পার্টি ডেটা এক্সপোর্ট', description: 'Download party lists and customer khata summaries', category: 'export' },
    ],
  },
  {
    id: 'mod_finance',
    code: 'FINANCE',
    name: 'Finance & Accounts',
    nameBn: 'অর্থ ও হিসাববিজ্ঞান',
    description: 'Income, expenses, bank accounts, bKash/Nagad wallets, cash flow, and equity.',
    descriptionBn: 'আয়-ব্যয়, ব্যাংক ও মোবাইল ওয়ালেট (bKash/Nagad), ক্যাশ ফ্লো ও মালিকের মূলধন।',
    iconName: 'Landmark',
    readOnlyPermissionIds: ['fin_view_overview', 'fin_view_transactions', 'fin_view_reports'],
    standardPermissionIds: ['fin_view_overview', 'fin_view_transactions', 'fin_create_transactions', 'fin_manage_expenses', 'fin_manage_payments'],
    permissions: [
      { id: 'fin_view_overview', code: 'FIN_VIEW_OVERVIEW', name: 'View Financial Overview', nameBn: 'আর্থিক বিবরণী দেখুন', description: 'Access cash position, daily cash book, and summaries', category: 'view' },
      { id: 'fin_view_transactions', code: 'FIN_VIEW_TRANSACTIONS', name: 'View Transactions', nameBn: 'লেনদেন তালিকা দেখুন', description: 'Inspect all income and expense vouchers', category: 'view' },
      { id: 'fin_create_transactions', code: 'FIN_CREATE_TRANSACTIONS', name: 'Record Transactions', nameBn: 'নতুন লেনদেন এন্ট্রি', description: 'Create receipt and payment vouchers', category: 'create', dependsOn: ['fin_view_transactions'] },
      { id: 'fin_edit_transactions', code: 'FIN_EDIT_TRANSACTIONS', name: 'Edit Transactions', nameBn: 'লেনদেন সম্পাদনা', description: 'Modify voucher heads, amounts, or payment modes', category: 'edit', isSensitive: true, dependsOn: ['fin_view_transactions'] },
      { id: 'fin_delete_transactions', code: 'FIN_DELETE_TRANSACTIONS', name: 'Delete Transactions', nameBn: 'লেনদেন মুছে ফেলুন', description: 'Delete recorded vouchers and reverse ledger entries', category: 'delete', isSensitive: true, dependsOn: ['fin_view_transactions'] },
      { id: 'fin_manage_expenses', code: 'FIN_MANAGE_EXPENSES', name: 'Manage Expenses', nameBn: 'খরচ পরিচালনা', description: 'Create expense heads, petty cash vouchers, and bills', category: 'create' },
      { id: 'fin_manage_payments', code: 'FIN_MANAGE_PAYMENTS', name: 'Process Payments', nameBn: 'পেমেন্ট সম্পন্ন করুন', description: 'Disburse supplier settlements and vendor cheques', category: 'special' },
      { id: 'fin_manage_banks', code: 'FIN_MANAGE_BANKS', name: 'Manage Bank & Wallets', nameBn: 'ব্যাংক ও ওয়ালেট ব্যবস্থাপনা', description: 'Add/configure bank accounts and MFS gateway keys', category: 'special', isSensitive: true },
      { id: 'fin_manage_capital', code: 'FIN_MANAGE_CAPITAL', name: 'Manage Owner Capital', nameBn: 'মালিকের মূলধন ও উত্তোলন', description: 'Record owner equity injections and personal drawings', category: 'special', isSensitive: true },
      { id: 'fin_view_reports', code: 'FIN_VIEW_REPORTS', name: 'View Profit & Loss', nameBn: 'লাভ-ক্ষতি ও ব্যালেন্স শীট', description: 'View net profit statement and trial balance', category: 'view', isSensitive: true },
      { id: 'fin_export', code: 'FIN_EXPORT', name: 'Export Financial Data', nameBn: 'আর্থিক হিসাব এক্সপোর্ট', description: 'Export balance sheet, cash book, and tax summaries', category: 'export', isSensitive: true },
    ],
  },
  {
    id: 'mod_hrm',
    code: 'HRM',
    name: 'HRM & Payroll',
    nameBn: 'এইচআরএম ও বেতন',
    description: 'Employee profiles, biometric attendance, leave approvals, salary slips, and bonuses.',
    descriptionBn: 'কর্মী ব্যবস্থাপনা, উপস্থিতি, ছুটির আবেদন, বেতন শিট প্রস্তুত ও স্যালারি স্লিপ।',
    iconName: 'UserCog',
    readOnlyPermissionIds: ['hrm_view_employees', 'hrm_view_attendance'],
    standardPermissionIds: ['hrm_view_employees', 'hrm_add_employees', 'hrm_manage_attendance', 'hrm_manage_leave'],
    permissions: [
      { id: 'hrm_view_employees', code: 'HRM_VIEW_EMPLOYEES', name: 'View Employees', nameBn: 'কর্মী তালিকা দেখুন', description: 'View employee directory, contacts, and designations', category: 'view' },
      { id: 'hrm_add_employees', code: 'HRM_ADD_EMPLOYEES', name: 'Add New Employees', nameBn: 'নতুন কর্মী যোগ করুন', description: 'Onboard new staff, capture NID, and set department', category: 'create', dependsOn: ['hrm_view_employees'] },
      { id: 'hrm_edit_employees', code: 'HRM_EDIT_EMPLOYEES', name: 'Edit Employee Records', nameBn: 'কর্মী তথ্য সম্পাদনা', description: 'Update salary grade, designation, and branch allocation', category: 'edit', isSensitive: true, dependsOn: ['hrm_view_employees'] },
      { id: 'hrm_delete_employees', code: 'HRM_DELETE_EMPLOYEES', name: 'Terminate / Delete Staff', nameBn: 'কর্মী ছাঁটাই বা মুছে ফেলুন', description: 'Deactivate employee profile and remove system access', category: 'delete', isSensitive: true, dependsOn: ['hrm_view_employees'] },
      { id: 'hrm_manage_attendance', code: 'HRM_MANAGE_ATTENDANCE', name: 'Manage Attendance', nameBn: 'উপস্থিতি পরিচালনা', description: 'Record daily punch in/out and manual overrides', category: 'edit' },
      { id: 'hrm_manage_leave', code: 'HRM_MANAGE_LEAVE', name: 'Approve Leave Requests', nameBn: 'ছুটি মঞ্জুর ও বাতিল', description: 'Review and approve/reject staff leave applications', category: 'approve' },
      { id: 'hrm_manage_payroll', code: 'HRM_MANAGE_PAYROLL', name: 'Process Payroll & Salary', nameBn: 'বেতন শিট ও স্যালারি প্রদান', description: 'Calculate monthly salaries, deductions, and bonuses', category: 'special', isSensitive: true },
      { id: 'hrm_view_reports', code: 'HRM_VIEW_REPORTS', name: 'View HR Reports', nameBn: 'এইচআর রিপোর্ট দেখুন', description: 'Inspect attendance trends and overtime logs', category: 'view' },
      { id: 'hrm_export', code: 'HRM_EXPORT', name: 'Export Payroll & Staff Data', nameBn: 'এইচআর ডেটা এক্সপোর্ট', description: 'Download bank salary sheets and attendance logs', category: 'export', isSensitive: true },
    ],
  },
  {
    id: 'mod_reports',
    code: 'REPORTS',
    name: 'Reports & Intelligence',
    nameBn: 'রিপোর্ট ও বিশ্লেষণ',
    description: 'Comprehensive business reports, sales insights, inventory audits, and tax returns.',
    descriptionBn: 'সামগ্রিক ব্যবসায়িক রিপোর্ট, সেলস অ্যানালিটিক্স, ট্যাক্স/ভ্যাট হিসেব ও পিডিএফ ডাউনলোড।',
    iconName: 'FileSpreadsheet',
    readOnlyPermissionIds: ['rep_view_sales', 'rep_view_inventory'],
    standardPermissionIds: ['rep_view_sales', 'rep_view_purchase', 'rep_view_inventory', 'rep_download_pdf'],
    permissions: [
      { id: 'rep_view_sales', code: 'REP_VIEW_SALES', name: 'View Sales Reports', nameBn: 'বিক্রয় রিপোর্ট দেখুন', description: 'Daily, monthly, and yearly sales summaries', category: 'view' },
      { id: 'rep_view_purchase', code: 'REP_VIEW_PURCHASE', name: 'View Purchase Reports', nameBn: 'ক্রয় রিপোর্ট দেখুন', description: 'Vendor expenditure and procurement statistics', category: 'view' },
      { id: 'rep_view_inventory', code: 'REP_VIEW_INVENTORY', name: 'View Inventory Reports', nameBn: 'ইনভেন্টরি স্টক রিপোর্ট', description: 'Stock movement, slow-moving items, and stock audit', category: 'view' },
      { id: 'rep_view_financial', code: 'REP_VIEW_FINANCIAL', name: 'View Financial Audits', nameBn: 'আর্থিক অডিট রিপোর্ট', description: 'Cash flow statement, VAT ledger, and expense splits', category: 'view', isSensitive: true },
      { id: 'rep_view_hr', code: 'REP_VIEW_HR', name: 'View HR & Payroll Reports', nameBn: 'এইচআর ও বেতন রিপোর্ট', description: 'Salary disbursement logs and leave breakdown', category: 'view', isSensitive: true },
      { id: 'rep_export_excel', code: 'REP_EXPORT_EXCEL', name: 'Export Data to Excel/CSV', nameBn: 'এক্সেল বা সিএসভি এক্সপোর্ট', description: 'Download raw tabular datasets', category: 'export' },
      { id: 'rep_download_pdf', code: 'REP_DOWNLOAD_PDF', name: 'Download PDF Reports', nameBn: 'পিডিএফ রিপোর্ট ডাউনলোড', description: 'Generate formatted printable audit reports', category: 'export' },
    ],
  },
  {
    id: 'mod_quotations',
    code: 'QUOTATIONS',
    name: 'Quotations & Estimates',
    nameBn: 'কোটেশন ও প্রাক্কলন',
    description: 'Price proposals, project estimates, discount approvals, and sale conversion.',
    descriptionBn: 'দর প্রস্তাব, প্রকল্প ব্যয় প্রাক্কলন ও সরাসরি বিক্রয়ে রূপান্তর।',
    iconName: 'FileText',
    readOnlyPermissionIds: ['quote_view'],
    standardPermissionIds: ['quote_view', 'quote_create', 'quote_edit', 'quote_convert'],
    permissions: [
      { id: 'quote_view', code: 'QUOTE_VIEW', name: 'View Quotations', nameBn: 'কোটেশন তালিকা দেখুন', description: 'Inspect sent and draft price proposals', category: 'view' },
      { id: 'quote_create', code: 'QUOTE_CREATE', name: 'Create Quotation', nameBn: 'নতুন কোটেশন তৈরি', description: 'Draft estimates with terms and item pricing', category: 'create', dependsOn: ['quote_view'] },
      { id: 'quote_edit', code: 'QUOTE_EDIT', name: 'Edit Quotations', nameBn: 'কোটেশন সম্পাদনা', description: 'Modify quote quantities, prices, and validities', category: 'edit', dependsOn: ['quote_view'] },
      { id: 'quote_delete', code: 'QUOTE_DELETE', name: 'Delete Quotations', nameBn: 'কোটেশন মুছে ফেলুন', description: 'Discard expired or rejected quotations', category: 'delete', dependsOn: ['quote_view'] },
      { id: 'quote_approve', code: 'QUOTE_APPROVE', name: 'Approve Quotation', nameBn: 'কোটেশন অনুমোদন', description: 'Authorize formal proposal sent to client', category: 'approve' },
      { id: 'quote_convert', code: 'QUOTE_CONVERT', name: 'Convert Quotation to Sale', nameBn: 'কোটেশন থেকে সেল ইনভয়েস', description: 'Instantly convert approved estimate into sale invoice', category: 'create', dependsOn: ['quote_view', 'sales_create'] },
    ],
  },
  {
    id: 'mod_settings',
    code: 'SETTINGS',
    name: 'Settings & Administration',
    nameBn: 'সেটিংস ও প্রশাসন',
    description: 'Company profile, branches, warehouses, user accounts, and security audit logs.',
    descriptionBn: 'কোম্পানি প্রোফাইল, শাখা, ওয়্যারহাউস, ইউজার অ্যাক্সেস ও অডিট লগ।',
    iconName: 'Settings',
    readOnlyPermissionIds: ['set_view_profile'],
    standardPermissionIds: ['set_view_profile'],
    permissions: [
      { id: 'set_view_profile', code: 'SET_VIEW_PROFILE', name: 'View Business Settings', nameBn: 'ব্যবসার সেটিংস দেখুন', description: 'Inspect invoice templates and company info', category: 'view' },
      { id: 'set_manage_business', code: 'SET_MANAGE_BUSINESS', name: 'Manage Business Profile', nameBn: 'কোম্পানি তথ্য পরিবর্তন', description: 'Update trade licence, logo, VAT/BIN numbers, and address', category: 'special', isSensitive: true },
      { id: 'set_manage_users', code: 'SET_MANAGE_USERS', name: 'Manage User Accounts', nameBn: 'ব্যবহারকারী অ্যাকাউন্ট নিয়ন্ত্রণ', description: 'Create user logins, reset passwords, and lock accounts', category: 'special', isSensitive: true },
      { id: 'set_manage_roles', code: 'SET_MANAGE_ROLES', name: 'Manage Roles & Permissions', nameBn: 'ভূমিকা ও পারমিশন পরিবর্তন', description: 'Configure granular module permissions and overrides', category: 'special', isSensitive: true },
      { id: 'set_manage_branches', code: 'SET_MANAGE_BRANCHES', name: 'Manage Branches & Outlets', nameBn: 'শাখা ও আউটলেট যোগ/বাতিল', description: 'Open new retail stores and branch locations', category: 'special', isSensitive: true },
      { id: 'set_view_audit_logs', code: 'SET_VIEW_AUDIT_LOGS', name: 'View Security Audit Logs', nameBn: 'নিরাপত্তা অডিট লগ দেখুন', description: 'Review system-wide access and security audit trail', category: 'view', isSensitive: true },
      { id: 'set_manage_subscription', code: 'SET_MANAGE_SUBSCRIPTION', name: 'Manage Subscription & Plan', nameBn: 'সাবস্ক্রিপশন ও বিলিং', description: 'Upgrade package, renew subscription, and invoices', category: 'special', isSensitive: true },
    ],
  },
];

// Helper: Flatten all permission IDs
export const ALL_PERMISSION_IDS = ERP_MODULES.flatMap((m) => m.permissions.map((p) => p.id));
export const ALL_SENSITIVE_PERMISSION_IDS = ERP_MODULES.flatMap((m) =>
  m.permissions.filter((p) => p.isSensitive).map((p) => p.id)
);

// Map permission id to permission object
export const PERMISSION_BY_ID_MAP = new Map<string, PermissionAction>();
ERP_MODULES.forEach((m) => {
  m.permissions.forEach((p) => {
    PERMISSION_BY_ID_MAP.set(p.id, p);
  });
});

// Map permission id to module object
export const MODULE_BY_PERMISSION_ID_MAP = new Map<string, ERPModuleDefinition>();
ERP_MODULES.forEach((m) => {
  m.permissions.forEach((p) => {
    MODULE_BY_PERMISSION_ID_MAP.set(p.id, m);
  });
});

// ─── BASE ROLE DEFINITIONS (TEMPLATES & INHERITANCE) ─────────────────────────

export const INITIAL_BASE_ROLES: BaseRoleDefinition[] = [
  {
    id: 'role-owner',
    name: 'Owner / Super Admin',
    nameBn: 'মালিক / সুপার অ্যাডমিন',
    description: 'Full uninhibited system access across all branches, accounts, and administration.',
    descriptionBn: 'সকল শাখা, আর্থিক হিসাব ও নিরাপত্তা সেটিংসের পূর্ণ অ্যাক্সেস।',
    isSystemProtected: true,
    color: '#8b5cf6',
    defaultDataScope: 'entire_business',
    defaultBranchMode: 'all',
    permissionIds: ALL_PERMISSION_IDS,
  },
  {
    id: 'role-branch-manager',
    name: 'Branch Manager',
    nameBn: 'শাখা ব্যবস্থাপক',
    description: 'Full operational control over assigned branch(es) including Sales, Purchases, Stock, and Staff.',
    descriptionBn: 'নির্দিষ্ট শাখার বিক্রয়, ক্রয়, স্টক ও কর্মীদের সম্পূর্ণ পরিচালনা।',
    isSystemProtected: true,
    color: '#0ea5e9',
    defaultDataScope: 'assigned_branches',
    defaultBranchMode: 'selected',
    permissionIds: [
      'dash_view_overview', 'dash_view_branch_kpi', 'dash_export_kpi',
      'sales_view', 'sales_create', 'sales_edit', 'sales_apply_discount', 'sales_process_return', 'sales_view_history', 'sales_export', 'sales_manage_pos',
      'pur_view', 'pur_create', 'pur_edit', 'pur_approve', 'pur_process_return', 'pur_view_history', 'pur_export',
      'inv_view', 'inv_add_products', 'inv_edit_products', 'inv_adjust_stock', 'inv_transfer_stock', 'inv_view_alerts', 'inv_batches', 'inv_export',
      'party_view_customers', 'party_create_customer', 'party_edit_customer', 'party_view_suppliers', 'party_create_supplier', 'party_view_transactions', 'party_export',
      'fin_view_overview', 'fin_view_transactions', 'fin_create_transactions', 'fin_manage_expenses', 'fin_manage_payments',
      'hrm_view_employees', 'hrm_manage_attendance', 'hrm_manage_leave',
      'rep_view_sales', 'rep_view_purchase', 'rep_view_inventory', 'rep_download_pdf',
      'quote_view', 'quote_create', 'quote_edit', 'quote_approve', 'quote_convert',
      'set_view_profile',
    ],
  },
  {
    id: 'role-sales-person',
    name: 'Sales Person / Cashier',
    nameBn: 'বিক্রয়কর্মী / ক্যাশিয়ার',
    description: 'Point of sale billing, customer lookup, and basic invoice generation with guardrails.',
    descriptionBn: 'পিওএস কাউন্টারে দ্রুত বিক্রয় বিলিং ও কাস্টমার লেজার দেখার অনুমতি।',
    isSystemProtected: true,
    color: '#10b981',
    defaultDataScope: 'own_records',
    defaultBranchMode: 'selected',
    permissionIds: [
      'dash_view_overview',
      'sales_view', 'sales_create', 'sales_view_history',
      'party_view_customers', 'party_create_customer',
      'quote_view', 'quote_create',
    ],
  },
  {
    id: 'role-inventory-manager',
    name: 'Inventory & Store Officer',
    nameBn: 'ইনভেন্টরি ও স্টোর অফিসার',
    description: 'Warehouse goods receipt, item stock tracking, batch FEFO expiry management, and transfers.',
    descriptionBn: 'ওয়্যারহাউস স্টক ট্র্যাকিং, ব্যাচ ও মেয়াদ পরিচালনা এবং গুদাম স্থানান্তর।',
    isSystemProtected: true,
    color: '#f59e0b',
    defaultDataScope: 'assigned_branches',
    defaultBranchMode: 'selected',
    permissionIds: [
      'dash_view_overview',
      'pur_view', 'pur_view_history',
      'inv_view', 'inv_add_products', 'inv_edit_products', 'inv_transfer_stock', 'inv_view_alerts', 'inv_batches', 'inv_export',
      'rep_view_inventory', 'rep_download_pdf',
    ],
  },
  {
    id: 'role-accountant',
    name: 'Chief Accountant',
    nameBn: 'প্রধান হিসাবরক্ষক',
    description: 'Financial ledger maintenance, voucher posting, supplier payments, and profit & loss analysis.',
    descriptionBn: 'আর্থিক হিসাববিজ্ঞান, ভাউচার এন্ট্রি, পেমেন্ট ও লাভ-ক্ষতির অডিট প্রস্তুত।',
    isSystemProtected: true,
    color: '#6366f1',
    defaultDataScope: 'entire_business',
    defaultBranchMode: 'all',
    permissionIds: [
      'dash_view_overview', 'dash_view_summary', 'dash_export_kpi',
      'sales_view', 'sales_view_history', 'sales_export',
      'pur_view', 'pur_view_history', 'pur_export',
      'party_view_customers', 'party_view_suppliers', 'party_manage_credit_limits', 'party_view_transactions', 'party_export',
      'fin_view_overview', 'fin_view_transactions', 'fin_create_transactions', 'fin_edit_transactions', 'fin_manage_expenses', 'fin_manage_payments', 'fin_manage_banks', 'fin_view_reports', 'fin_export',
      'rep_view_sales', 'rep_view_purchase', 'rep_view_inventory', 'rep_view_financial', 'rep_export_excel', 'rep_download_pdf',
    ],
  },
  {
    id: 'role-hr-manager',
    name: 'HR & Admin Manager',
    nameBn: 'এইচআর ও অ্যাডমিন ম্যানেজার',
    description: 'Staff onboarding, attendance logging, leave sanctions, and monthly payroll calculation.',
    descriptionBn: 'কর্মী রিক্রুটমেন্ট, উপস্থিতি পর্যবেক্ষণ, ছুটি অনুমোদন এবং স্যালারি শিট প্রসেসিং।',
    isSystemProtected: false,
    color: '#ec4899',
    defaultDataScope: 'entire_business',
    defaultBranchMode: 'all',
    permissionIds: [
      'dash_view_overview',
      'hrm_view_employees', 'hrm_add_employees', 'hrm_edit_employees', 'hrm_manage_attendance', 'hrm_manage_leave', 'hrm_manage_payroll', 'hrm_view_reports', 'hrm_export',
      'rep_view_hr', 'rep_download_pdf',
    ],
  },
];

// ─── INITIAL USER ACCESS PROFILES (MOCK DATA) ────────────────────────────────

export const INITIAL_USER_PROFILES: UserAccessProfile[] = [
  {
    id: 'u-1',
    userId: 'usr-sweet-ali',
    employeeId: 'EMP-001',
    name: 'Sweet Ali',
    nameBn: 'সুইট আলী',
    email: 'sweet.ali@hellokhata.com',
    phone: '01711-001122',
    department: 'Management',
    designation: 'Business Owner & Founder',
    status: 'active',
    isOwner: true,
    isFullSystemAccess: true,
    baseRoleId: 'role-owner',
    accessLevel: 'full_system',
    branchScopeMode: 'all',
    allowedBranchIds: ['branch-1', 'branch-2', 'branch-3', 'branch-4', 'branch-5'],
    dataScope: 'entire_business',
    customGrantedPermissions: [],
    customRevokedPermissions: [],
    lastActive: 'Just now',
    updatedAt: '2026-09-14 10:30 AM',
    updatedBy: 'System SuperAdmin',
  },
  {
    id: 'u-2',
    userId: 'usr-mamun',
    employeeId: 'EMP-002',
    name: 'Mamunur Rashid',
    nameBn: 'মামুনুর রশীদ',
    email: 'mamun@hellokhata.com',
    phone: '01822-334455',
    department: 'Operations',
    designation: 'Dhaka Branch Manager',
    status: 'active',
    isOwner: false,
    isFullSystemAccess: false,
    baseRoleId: 'role-branch-manager',
    accessLevel: 'branch_restricted',
    branchScopeMode: 'selected',
    allowedBranchIds: ['branch-1'],
    dataScope: 'assigned_branches',
    customGrantedPermissions: ['sales_price_override', 'inv_manage_warehouses'],
    customRevokedPermissions: ['set_view_profile'],
    lastActive: '12 mins ago',
    updatedAt: '2026-09-12 04:15 PM',
    updatedBy: 'Sweet Ali',
  },
  {
    id: 'u-3',
    userId: 'usr-rahim',
    employeeId: 'EMP-003',
    name: 'Rahim Sheikh',
    nameBn: 'রহিম শেখ',
    email: 'rahim.sales@hellokhata.com',
    phone: '01933-445566',
    department: 'Sales',
    designation: 'Senior Sales Executive',
    status: 'active',
    isOwner: false,
    isFullSystemAccess: false,
    baseRoleId: 'role-sales-person',
    accessLevel: 'custom_access',
    branchScopeMode: 'selected',
    allowedBranchIds: ['branch-1'],
    dataScope: 'own_records',
    customGrantedPermissions: ['sales_process_return', 'sales_apply_discount'],
    customRevokedPermissions: ['quote_create'],
    lastActive: '3 mins ago',
    updatedAt: '2026-09-15 09:40 AM',
    updatedBy: 'Sweet Ali',
  },
  {
    id: 'u-4',
    userId: 'usr-farhana',
    employeeId: 'EMP-004',
    name: 'Farhana Akter',
    nameBn: 'ফারহানা আক্তার',
    email: 'farhana.acc@hellokhata.com',
    phone: '01844-556677',
    department: 'Accounts & Finance',
    designation: 'Head of Accounts',
    status: 'active',
    isOwner: false,
    isFullSystemAccess: false,
    baseRoleId: 'role-accountant',
    accessLevel: 'custom_access',
    branchScopeMode: 'all',
    allowedBranchIds: ['branch-1', 'branch-2', 'branch-3'],
    dataScope: 'entire_business',
    customGrantedPermissions: ['hrm_manage_payroll'],
    customRevokedPermissions: ['fin_manage_capital'],
    lastActive: '1 hour ago',
    updatedAt: '2026-09-10 11:20 AM',
    updatedBy: 'Sweet Ali',
  },
  {
    id: 'u-5',
    userId: 'usr-tariq',
    employeeId: 'EMP-005',
    name: 'Tariqul Islam',
    nameBn: 'তরিকুল ইসলাম',
    email: 'tariq.store@hellokhata.com',
    phone: '01755-667788',
    department: 'Warehouse',
    designation: 'Central Warehouse Keeper',
    status: 'active',
    isOwner: false,
    isFullSystemAccess: false,
    baseRoleId: 'role-inventory-manager',
    accessLevel: 'branch_restricted',
    branchScopeMode: 'selected',
    allowedBranchIds: ['branch-1', 'branch-2'],
    dataScope: 'assigned_branches',
    customGrantedPermissions: ['pur_create'],
    customRevokedPermissions: [],
    lastActive: 'Yesterday',
    updatedAt: '2026-09-08 02:00 PM',
    updatedBy: 'Mamunur Rashid',
  },
  {
    id: 'u-6',
    userId: 'usr-nasrin',
    employeeId: 'EMP-006',
    name: 'Nasrin Sultana',
    nameBn: 'নাসরিন সুলতানা',
    email: 'nasrin.hr@hellokhata.com',
    phone: '01666-778899',
    department: 'Human Resources',
    designation: 'HR Executive',
    status: 'active',
    isOwner: false,
    isFullSystemAccess: false,
    baseRoleId: 'role-hr-manager',
    accessLevel: 'restricted',
    branchScopeMode: 'all',
    allowedBranchIds: ['branch-1', 'branch-2', 'branch-3', 'branch-4', 'branch-5'],
    dataScope: 'entire_business',
    customGrantedPermissions: [],
    customRevokedPermissions: ['hrm_manage_payroll'],
    lastActive: '2 days ago',
    updatedAt: '2026-09-05 03:45 PM',
    updatedBy: 'Sweet Ali',
  },
];

// ─── INITIAL AUDIT LOGS ──────────────────────────────────────────────────────

export const INITIAL_AUDIT_LOGS: AccessAuditEntry[] = [
  {
    id: 'aud-101',
    timestamp: 'Today, 09:40 AM',
    performedBy: 'Sweet Ali (Owner)',
    targetUserName: 'Rahim Sheikh',
    targetUserRole: 'Sales Person',
    actionType: 'permission_override',
    addedPermissions: ['Sales → Process Sales Returns', 'Sales → Apply Discounts'],
    removedPermissions: ['Quotations → Create Quotation'],
    notes: 'Granted return and discount privileges for POS desk rush hour.',
  },
  {
    id: 'aud-102',
    timestamp: 'Yesterday, 04:15 PM',
    performedBy: 'Sweet Ali (Owner)',
    targetUserName: 'Mamunur Rashid',
    targetUserRole: 'Branch Manager',
    actionType: 'branch_scope_updated',
    addedPermissions: ['Sales → Override Unit Prices'],
    removedPermissions: ['Settings → View Business Settings'],
    branchChanges: { added: ['Dhaka Main Branch'], removed: ['Chittagong Branch'] },
    notes: 'Locked branch scope strictly to Dhaka Main Branch with price override ability.',
  },
  {
    id: 'aud-103',
    timestamp: '14 Sep, 10:30 AM',
    performedBy: 'System SuperAdmin',
    targetUserName: 'Sweet Ali',
    targetUserRole: 'Owner / Super Admin',
    actionType: 'full_access_granted',
    addedPermissions: ['All ERP Modules & Actions'],
    removedPermissions: [],
    notes: 'Primary enterprise organization initialized with Full System Access.',
  },
];

// ─── HELPER: Compute Effective Permissions for a User ────────────────────────

export function computeEffectivePermissions(
  user: UserAccessProfile,
  baseRoles: BaseRoleDefinition[]
): Set<string> {
  if (user.isFullSystemAccess || user.isOwner) {
    return new Set(ALL_PERMISSION_IDS);
  }

  const role = baseRoles.find((r) => r.id === user.baseRoleId);
  const basePermissions = new Set(role ? role.permissionIds : []);

  // Apply custom granted overrides (+)
  user.customGrantedPermissions.forEach((pId) => basePermissions.add(pId));

  // Apply custom revoked overrides (-)
  user.customRevokedPermissions.forEach((pId) => basePermissions.delete(pId));

  return basePermissions;
}

// ─── TABLE HELPER FUNCTIONS ──────────────────────────────────────────────────

function getModuleIcon(idOrCode: string) {
  switch (idOrCode) {
    case 'mod_dashboard':
    case 'DASHBOARD':
      return <LayoutGrid className="w-3 h-3 text-sky-400 shrink-0" />;
    case 'mod_sales':
    case 'SALES_POS':
      return <ShoppingCart className="w-3 h-3 text-emerald-400 shrink-0" />;
    case 'mod_purchases':
    case 'PURCHASES':
      return <Truck className="w-3 h-3 text-amber-400 shrink-0" />;
    case 'mod_inventory':
    case 'INVENTORY':
      return <Package className="w-3 h-3 text-indigo-400 shrink-0" />;
    case 'mod_parties':
    case 'PARTIES':
      return <Users className="w-3 h-3 text-blue-400 shrink-0" />;
    case 'mod_finance':
    case 'FINANCE':
      return <Landmark className="w-3 h-3 text-cyan-400 shrink-0" />;
    case 'mod_hrm':
    case 'HRM':
      return <Briefcase className="w-3 h-3 text-pink-400 shrink-0" />;
    case 'mod_reports':
    case 'REPORTS':
      return <FileSpreadsheet className="w-3 h-3 text-purple-400 shrink-0" />;
    case 'mod_quotations':
    case 'QUOTATIONS':
      return <FileText className="w-3 h-3 text-teal-400 shrink-0" />;
    case 'mod_settings':
    case 'SETTINGS':
      return <Settings className="w-3 h-3 text-slate-400 shrink-0" />;
    default:
      return <Layers className="w-3 h-3 text-muted-foreground shrink-0" />;
  }
}

function getModuleShortName(m: ERPModuleDefinition, isBangla: boolean) {
  if (isBangla) {
    if (m.id === 'mod_dashboard') return 'ড্যাশবোর্ড';
    if (m.id === 'mod_sales') return 'বিক্রয়';
    if (m.id === 'mod_purchases') return 'ক্রয়';
    if (m.id === 'mod_inventory') return 'ইনভেন্টরি';
    if (m.id === 'mod_parties') return 'পার্টি';
    if (m.id === 'mod_finance') return 'হিসাববিজ্ঞান';
    if (m.id === 'mod_hrm') return 'এইচআরএম';
    if (m.id === 'mod_reports') return 'রিপোর্ট';
    if (m.id === 'mod_quotations') return 'কোটেশন';
    if (m.id === 'mod_settings') return 'সেটিংস';
    return m.nameBn;
  }
  if (m.id === 'mod_dashboard') return 'Dashboard';
  if (m.id === 'mod_sales') return 'Sales';
  if (m.id === 'mod_purchases') return 'Purchases';
  if (m.id === 'mod_inventory') return 'Inventory';
  if (m.id === 'mod_parties') return 'Parties';
  if (m.id === 'mod_finance') return 'Finance';
  if (m.id === 'mod_hrm') return 'HRM';
  if (m.id === 'mod_reports') return 'Reports';
  if (m.id === 'mod_quotations') return 'Quotations';
  if (m.id === 'mod_settings') return 'Settings';
  return m.name.split(' ')[0];
}

function getStaffInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// ─── MAIN REACT COMPONENT ────────────────────────────────────────────────────

export default function UserAccessControlPage() {
  const { isBangla } = useAppTranslation();

  // State: Core Collections
  const [users, setUsers] = useState<UserAccessProfile[]>(INITIAL_USER_PROFILES);
  const [baseRoles, setBaseRoles] = useState<BaseRoleDefinition[]>(INITIAL_BASE_ROLES);
  const [auditLogs, setAuditLogs] = useState<AccessAuditEntry[]>(INITIAL_AUDIT_LOGS);



  // Table Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleTypeFilter, setRoleTypeFilter] = useState<'all' | 'system' | 'custom'>('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [accessLevelFilter, setAccessLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Role Edit & Add Modal State
  const [editingRole, setEditingRole] = useState<BaseRoleDefinition | null>(null);
  const [editingRolePermissions, setEditingRolePermissions] = useState<string[]>([]);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // View Staff Modal State
  const [viewStaffRole, setViewStaffRole] = useState<BaseRoleDefinition | null>(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  // Selected User for Manage Access Modal
  const [activeUser, setActiveUser] = useState<UserAccessProfile | null>(null);
  const [isManageAccessOpen, setIsManageAccessOpen] = useState(false);

  // Manage Access Draft State (Working copy inside modal)
  const [draftUser, setDraftUser] = useState<UserAccessProfile | null>(null);
  const [expandedModuleIds, setExpandedModuleIds] = useState<string[]>(['mod_sales', 'mod_inventory']);
  const [permissionModuleSearch, setPermissionModuleSearch] = useState('');
  const [permissionStatusFilter, setPermissionStatusFilter] = useState<'all' | 'granted' | 'not_granted' | 'overridden' | 'sensitive'>('all');

  // Dialogs & Safety Confirmations
  const [isDiffConfirmOpen, setIsDiffConfirmOpen] = useState(false);
  const [isFullAccessWarningOpen, setIsFullAccessWarningOpen] = useState(false);
  const [isQuickPreviewDrawerOpen, setIsQuickPreviewDrawerOpen] = useState(false);
  const [previewingUser, setPreviewingUser] = useState<UserAccessProfile | null>(null);

  // Add User / Assign Staff Wizard
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserStep, setNewUserStep] = useState(1);
  const [newUserData, setNewUserData] = useState<Partial<UserAccessProfile>>({
    name: '',
    email: '',
    phone: '',
    department: 'Sales',
    designation: 'Sales Executive',
    baseRoleId: 'role-sales-person',
    branchScopeMode: 'selected',
    allowedBranchIds: ['branch-1'],
    dataScope: 'own_records',
    isFullSystemAccess: false,
    customGrantedPermissions: [],
    customRevokedPermissions: [],
    status: 'active',
  });

  // ─── COMPUTED STATS ────────────────────────────────────────────────────────

  const totalUsersCount = users.length;
  const fullAccessCount = users.filter((u) => u.isFullSystemAccess || u.isOwner).length;
  const restrictedCount = users.filter((u) => !u.isFullSystemAccess && !u.isOwner && u.accessLevel !== 'unassigned').length;
  const unassignedCount = users.filter((u) => u.accessLevel === 'unassigned').length;
  const multiBranchCount = users.filter((u) => u.branchScopeMode === 'all' || u.allowedBranchIds.length > 1).length;

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.nameBn.includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        u.employeeId.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q);

      // Branch filter
      const matchBranch =
        branchFilter === 'all' ||
        (u.branchScopeMode === 'all' ? true : u.allowedBranchIds.includes(branchFilter));

      // Role filter
      const matchRole = roleFilter === 'all' || u.baseRoleId === roleFilter;

      // Access level filter
      const matchAccess =
        accessLevelFilter === 'all' ||
        (accessLevelFilter === 'full_system' && (u.isFullSystemAccess || u.isOwner)) ||
        (accessLevelFilter === 'branch_restricted' && u.accessLevel === 'branch_restricted') ||
        (accessLevelFilter === 'custom_access' && u.accessLevel === 'custom_access') ||
        (accessLevelFilter === 'restricted' && u.accessLevel === 'restricted');

      // Status filter
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;

      return matchQuery && matchBranch && matchRole && matchAccess && matchStatus;
    });
  }, [users, searchQuery, branchFilter, roleFilter, accessLevelFilter, statusFilter]);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    return baseRoles.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.nameBn.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.descriptionBn.toLowerCase().includes(q);

      const matchType =
        roleTypeFilter === 'all' ||
        (roleTypeFilter === 'system' && r.isSystemProtected) ||
        (roleTypeFilter === 'custom' && !r.isSystemProtected);

      const matchStatus = statusFilter === 'all' || statusFilter === 'active';

      return matchQuery && matchType && matchStatus;
    });
  }, [baseRoles, searchQuery, roleTypeFilter, statusFilter]);

  const handleOpenAddRole = () => {
    const newRole: BaseRoleDefinition = {
      id: `role-custom-${Date.now()}`,
      name: '',
      nameBn: '',
      description: '',
      descriptionBn: '',
      isSystemProtected: false,
      color: '#3b82f6',
      defaultDataScope: 'assigned_branches',
      defaultBranchMode: 'selected',
      permissionIds: [],
    };
    setEditingRole(newRole);
    setEditingRolePermissions([]);
    setIsRoleModalOpen(true);
  };

  const handleEditRole = (role: BaseRoleDefinition) => {
    setEditingRole({ ...role });
    setEditingRolePermissions([...role.permissionIds]);
    setIsRoleModalOpen(true);
  };

  const handleToggleRolePermission = (permId: string) => {
    setEditingRolePermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleToggleAllModulePermissions = (module: ERPModuleDefinition, enable: boolean) => {
    const modPermIds = module.permissions.map((p) => p.id);
    if (enable) {
      setEditingRolePermissions((prev) => Array.from(new Set([...prev, ...modPermIds])));
    } else {
      setEditingRolePermissions((prev) => prev.filter((p) => !modPermIds.includes(p)));
    }
  };

  const handleSaveRole = () => {
    if (!editingRole) return;
    if (!editingRole.name.trim()) {
      toast.error(isBangla ? 'অনুগ্রহ করে রোলের নাম লিখুন।' : 'Please enter role name.');
      return;
    }
    const updatedRole: BaseRoleDefinition = {
      ...editingRole,
      permissionIds: editingRolePermissions,
    };
    setBaseRoles((prev) => {
      const exists = prev.some((r) => r.id === editingRole.id);
      if (exists) {
        return prev.map((r) => (r.id === editingRole.id ? updatedRole : r));
      } else {
        return [...prev, updatedRole];
      }
    });
    setIsRoleModalOpen(false);
    toast.success(
      isBangla
        ? `রোল "${updatedRole.name}" সফলভাবে সংরক্ষিত হয়েছে!`
        : `Role "${updatedRole.name}" saved successfully!`
    );
  };

  const handleDeleteRole = (role: BaseRoleDefinition) => {
    if (role.isSystemProtected) {
      toast.error(isBangla ? 'সিস্টেম রোল মুছে ফেলা সম্ভব নয়!' : 'System-protected roles cannot be deleted!');
      return;
    }
    const hasAssignedStaff = users.some((u) => u.baseRoleId === role.id);
    if (hasAssignedStaff) {
      toast.error(
        isBangla
          ? 'এই রোলে কর্মী নিযুক্ত রয়েছে। আগে কর্মীদের ভূমিকা পরিবর্তন করুন।'
          : 'Staff members are assigned to this role. Please reassign them first.'
      );
      return;
    }
    setBaseRoles((prev) => prev.filter((r) => r.id !== role.id));
    toast.success(isBangla ? `রোল "${role.name}" মুছে ফেলা হয়েছে!` : `Role "${role.name}" deleted!`);
  };

  const handleViewStaff = (role: BaseRoleDefinition) => {
    setViewStaffRole(role);
    setIsStaffModalOpen(true);
  };

  // ─── MANAGE ACCESS HANDLERS ────────────────────────────────────────────────

  const handleOpenManageAccess = (user: UserAccessProfile) => {
    setActiveUser(user);
    // Deep clone working draft
    setDraftUser(JSON.parse(JSON.stringify(user)));
    setIsManageAccessOpen(true);
  };

  const handleToggleFullSystemAccess = (enable: boolean) => {
    if (!draftUser) return;
    if (enable) {
      setIsFullAccessWarningOpen(true);
    } else {
      setDraftUser({
        ...draftUser,
        isFullSystemAccess: false,
        accessLevel: draftUser.allowedBranchIds.length < HRM_BRANCHES.length ? 'branch_restricted' : 'custom_access',
      });
      toast.info(isBangla ? 'পূর্ণ সিস্টেম অ্যাক্সেস নিষ্ক্রিয় করা হয়েছে।' : 'Full System Access disabled. Base role permissions restored.');
    }
  };

  const confirmGrantFullSystemAccess = () => {
    if (!draftUser) return;
    setDraftUser({
      ...draftUser,
      isFullSystemAccess: true,
      accessLevel: 'full_system',
      branchScopeMode: 'all',
      allowedBranchIds: HRM_BRANCHES.map((b) => b.id),
      dataScope: 'entire_business',
      customGrantedPermissions: [],
      customRevokedPermissions: [],
    });
    setIsFullAccessWarningOpen(false);
    toast.success(
      isBangla
        ? 'সতর্কতা: এই ব্যবহারকারীকে পূর্ণ সিস্টেম অ্যাক্সেস প্রদান করা হয়েছে!'
        : 'Full System Access granted! User now has unrestricted access across all branches and modules.'
    );
  };

  const handleBaseRoleChange = (roleId: string) => {
    if (!draftUser) return;
    const selectedRole = baseRoles.find((r) => r.id === roleId);
    if (!selectedRole) return;

    setDraftUser({
      ...draftUser,
      baseRoleId: roleId,
      isFullSystemAccess: selectedRole.id === 'role-owner',
      accessLevel: selectedRole.id === 'role-owner' ? 'full_system' : 'custom_access',
      dataScope: selectedRole.defaultDataScope,
      branchScopeMode: selectedRole.defaultBranchMode,
      // Clear overrides when switching base role
      customGrantedPermissions: [],
      customRevokedPermissions: [],
    });
    toast.info(
      isBangla
        ? `বেস ভূমিকা "${selectedRole.nameBn}" হিসেবে নির্বাচন করা হয়েছে।`
        : `Base role changed to "${selectedRole.name}". Default permissions applied.`
    );
  };

  const handleToggleBranch = (branchId: string) => {
    if (!draftUser || draftUser.isFullSystemAccess) return;
    const exists = draftUser.allowedBranchIds.includes(branchId);
    let newBranches: string[];
    if (exists) {
      if (draftUser.allowedBranchIds.length === 1) {
        toast.error(isBangla ? 'কমপক্ষে একটি শাখা নির্বাচন করতে হবে।' : 'At least one branch must be assigned.');
        return;
      }
      newBranches = draftUser.allowedBranchIds.filter((id) => id !== branchId);
    } else {
      newBranches = [...draftUser.allowedBranchIds, branchId];
    }

    setDraftUser({
      ...draftUser,
      allowedBranchIds: newBranches,
      branchScopeMode: newBranches.length === HRM_BRANCHES.length ? 'all' : 'selected',
      accessLevel: newBranches.length < HRM_BRANCHES.length ? 'branch_restricted' : 'custom_access',
    });
  };

  const handleToggleAllBranches = (all: boolean) => {
    if (!draftUser || draftUser.isFullSystemAccess) return;
    if (all) {
      setDraftUser({
        ...draftUser,
        branchScopeMode: 'all',
        allowedBranchIds: HRM_BRANCHES.map((b) => b.id),
      });
    } else {
      setDraftUser({
        ...draftUser,
        branchScopeMode: 'selected',
        allowedBranchIds: [HRM_BRANCHES[0].id],
        accessLevel: 'branch_restricted',
      });
    }
  };

  // ─── PERMISSION LEVEL & CUSTOM OVERRIDES ────────────────────────────────────

  const draftEffectivePermissions = useMemo(() => {
    if (!draftUser) return new Set<string>();
    return computeEffectivePermissions(draftUser, baseRoles);
  }, [draftUser, baseRoles]);

  const activeRoleDefinition = useMemo(() => {
    if (!draftUser) return null;
    return baseRoles.find((r) => r.id === draftUser.baseRoleId) || null;
  }, [draftUser, baseRoles]);

  const handlePermissionToggle = (permissionId: string) => {
    if (!draftUser || draftUser.isFullSystemAccess || !activeRoleDefinition) return;

    const isCurrentlyGranted = draftEffectivePermissions.has(permissionId);
    const roleHasIt = activeRoleDefinition.permissionIds.includes(permissionId);

    let newGranted = [...draftUser.customGrantedPermissions];
    let newRevoked = [...draftUser.customRevokedPermissions];

    if (isCurrentlyGranted) {
      // User currently has it -> REVOKE
      if (roleHasIt) {
        // Role naturally grants it -> Add to revoked list
        if (!newRevoked.includes(permissionId)) newRevoked.push(permissionId);
      } else {
        // Was custom granted -> Remove from granted list
        newGranted = newGranted.filter((id) => id !== permissionId);
      }
    } else {
      // User currently does NOT have it -> GRANT
      if (roleHasIt) {
        // Was in revoked list -> Remove from revoked list
        newRevoked = newRevoked.filter((id) => id !== permissionId);
      } else {
        // Role doesn't have it -> Add to custom granted list
        if (!newGranted.includes(permissionId)) newGranted.push(permissionId);
      }
    }

    setDraftUser({
      ...draftUser,
      customGrantedPermissions: newGranted,
      customRevokedPermissions: newRevoked,
      accessLevel: 'custom_access',
    });
  };

  const handleModuleQuickLevelChange = (module: ERPModuleDefinition, level: PermissionLevelType) => {
    if (!draftUser || draftUser.isFullSystemAccess || !activeRoleDefinition) return;

    const modulePermissionIds = module.permissions.map((p) => p.id);
    let targetGrantedIds: string[] = [];

    if (level === 'no_access') {
      targetGrantedIds = [];
    } else if (level === 'read_only') {
      targetGrantedIds = module.readOnlyPermissionIds;
    } else if (level === 'standard') {
      targetGrantedIds = module.standardPermissionIds;
    } else if (level === 'full_access') {
      targetGrantedIds = modulePermissionIds;
    } else {
      // Custom - just expand
      if (!expandedModuleIds.includes(module.id)) {
        setExpandedModuleIds([...expandedModuleIds, module.id]);
      }
      return;
    }

    // Recalculate custom overrides for this module
    let newGranted = draftUser.customGrantedPermissions.filter((id) => !modulePermissionIds.includes(id));
    let newRevoked = draftUser.customRevokedPermissions.filter((id) => !modulePermissionIds.includes(id));

    module.permissions.forEach((p) => {
      const shouldHave = targetGrantedIds.includes(p.id);
      const roleHas = activeRoleDefinition.permissionIds.includes(p.id);

      if (shouldHave && !roleHas) {
        newGranted.push(p.id);
      } else if (!shouldHave && roleHas) {
        newRevoked.push(p.id);
      }
    });

    setDraftUser({
      ...draftUser,
      customGrantedPermissions: newGranted,
      customRevokedPermissions: newRevoked,
      accessLevel: 'custom_access',
    });

    toast.success(
      isBangla
        ? `মডিউল "${module.nameBn}" এর অনুমতি "${level}" হিসেবে সেট করা হয়েছে।`
        : `"${module.name}" updated to ${level.replace('_', ' ').toUpperCase()}.`
    );
  };

  const handleResetModuleToRole = (module: ERPModuleDefinition) => {
    if (!draftUser) return;
    const modulePermissionIds = module.permissions.map((p) => p.id);
    const newGranted = draftUser.customGrantedPermissions.filter((id) => !modulePermissionIds.includes(id));
    const newRevoked = draftUser.customRevokedPermissions.filter((id) => !modulePermissionIds.includes(id));

    setDraftUser({
      ...draftUser,
      customGrantedPermissions: newGranted,
      customRevokedPermissions: newRevoked,
    });

    toast.info(
      isBangla
        ? `মডিউল "${module.nameBn}" ভূমিকা অনুযায়ী রিসেট করা হয়েছে।`
        : `"${module.name}" reset to base role defaults.`
    );
  };

  const handleResetAllToRole = () => {
    if (!draftUser) return;
    setDraftUser({
      ...draftUser,
      customGrantedPermissions: [],
      customRevokedPermissions: [],
      accessLevel: draftUser.allowedBranchIds.length < HRM_BRANCHES.length ? 'branch_restricted' : 'custom_access',
    });
    toast.success(
      isBangla
        ? 'সকল কাস্টম ওভাররাইড মুছে ফেলা হয়েছে এবং মূল ভূমিকার অনুমতি বহাল রাখা হয়েছে।'
        : 'All custom overrides cleared. Reverted to base role permissions.'
    );
  };

  // ─── DIFF COMPUTATION FOR REVIEW MODAL ──────────────────────────────────────

  const permissionDiff = useMemo(() => {
    if (!activeUser || !draftUser) return { added: [], removed: [], branchAdded: [], branchRemoved: [], sensitiveGranted: [] };

    const oldPerms = computeEffectivePermissions(activeUser, baseRoles);
    const newPerms = computeEffectivePermissions(draftUser, baseRoles);

    const added: PermissionAction[] = [];
    const removed: PermissionAction[] = [];
    const sensitiveGranted: PermissionAction[] = [];

    newPerms.forEach((pId) => {
      if (!oldPerms.has(pId)) {
        const pObj = PERMISSION_BY_ID_MAP.get(pId);
        if (pObj) {
          added.push(pObj);
          if (pObj.isSensitive) sensitiveGranted.push(pObj);
        }
      }
    });

    oldPerms.forEach((pId) => {
      if (!newPerms.has(pId)) {
        const pObj = PERMISSION_BY_ID_MAP.get(pId);
        if (pObj) removed.push(pObj);
      }
    });

    const oldBranches = new Set(activeUser.allowedBranchIds);
    const newBranches = new Set(draftUser.allowedBranchIds);

    const branchAdded = draftUser.allowedBranchIds.filter((id) => !oldBranches.has(id));
    const branchRemoved = activeUser.allowedBranchIds.filter((id) => !newBranches.has(id));

    return { added, removed, branchAdded, branchRemoved, sensitiveGranted };
  }, [activeUser, draftUser, baseRoles]);

  const handleSaveDraftChanges = () => {
    if (!draftUser || !activeUser) return;

    // Check if there are diffs
    const hasPermDiff = permissionDiff.added.length > 0 || permissionDiff.removed.length > 0;
    const hasBranchDiff = permissionDiff.branchAdded.length > 0 || permissionDiff.branchRemoved.length > 0;
    const hasRoleDiff = activeUser.baseRoleId !== draftUser.baseRoleId;
    const hasFullAccessDiff = activeUser.isFullSystemAccess !== draftUser.isFullSystemAccess;

    if (!hasPermDiff && !hasBranchDiff && !hasRoleDiff && !hasFullAccessDiff) {
      // No meaningful diff
      setUsers((prev) => prev.map((u) => (u.id === draftUser.id ? draftUser : u)));
      setIsManageAccessOpen(false);
      toast.success(isBangla ? 'পরিবর্তন সংরক্ষিত হয়েছে।' : 'Changes saved successfully.');
      return;
    }

    // Open Diff confirmation modal for explicit safety review
    setIsDiffConfirmOpen(true);
  };

  const handleConfirmAndApplyChanges = () => {
    if (!draftUser || !activeUser) return;

    // Create Audit Log
    const newAudit: AccessAuditEntry = {
      id: `aud-${Date.now()}`,
      timestamp: 'Just now',
      performedBy: 'Sweet Ali (Owner)',
      targetUserName: draftUser.name,
      targetUserRole: baseRoles.find((r) => r.id === draftUser.baseRoleId)?.name || 'Custom',
      actionType: draftUser.isFullSystemAccess ? 'full_access_granted' : 'permission_override',
      addedPermissions: permissionDiff.added.map((p) => `${MODULE_BY_PERMISSION_ID_MAP.get(p.id)?.name || ''} → ${p.name}`),
      removedPermissions: permissionDiff.removed.map((p) => `${MODULE_BY_PERMISSION_ID_MAP.get(p.id)?.name || ''} → ${p.name}`),
      branchChanges: {
        added: permissionDiff.branchAdded.map((id) => HRM_BRANCHES.find((b) => b.id === id)?.name || id),
        removed: permissionDiff.branchRemoved.map((id) => HRM_BRANCHES.find((b) => b.id === id)?.name || id),
      },
      notes: `Access profile updated by Owner with ${permissionDiff.added.length} added and ${permissionDiff.removed.length} revoked permissions.`,
    };

    setUsers((prev) =>
      prev.map((u) =>
        u.id === draftUser.id
          ? {
              ...draftUser,
              updatedAt: 'Just now',
              updatedBy: 'Sweet Ali',
            }
          : u
      )
    );

    setAuditLogs((prev) => [newAudit, ...prev]);
    setIsDiffConfirmOpen(false);
    setIsManageAccessOpen(false);
    toast.success(
      isBangla
        ? `সফলভাবে ${draftUser.name} এর অ্যাক্সেস ও অনুমতি আপডেট করা হয়েছে!`
        : `Access control and permissions updated for ${draftUser.name}!`
    );
  };

  // ─── ADD NEW USER / ASSIGN ACCESS ──────────────────────────────────────────

  const handleCreateNewUser = () => {
    if (!newUserData.name || !newUserData.email) {
      toast.error(isBangla ? 'নাম ও ইমেইল আবশ্যক।' : 'Name and Email are required.');
      return;
    }

    const createdUser: UserAccessProfile = {
      id: `u-${Date.now()}`,
      userId: `usr-${Date.now()}`,
      employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newUserData.name || 'New Staff',
      nameBn: newUserData.nameBn || newUserData.name || 'নতুন কর্মী',
      email: newUserData.email || '',
      phone: newUserData.phone || '01700-000000',
      department: newUserData.department || 'Sales',
      designation: newUserData.designation || 'Staff',
      status: 'active',
      isOwner: false,
      isFullSystemAccess: !!newUserData.isFullSystemAccess,
      baseRoleId: newUserData.baseRoleId || 'role-sales-person',
      accessLevel: newUserData.isFullSystemAccess ? 'full_system' : 'custom_access',
      branchScopeMode: newUserData.branchScopeMode || 'selected',
      allowedBranchIds: newUserData.allowedBranchIds || ['branch-1'],
      dataScope: newUserData.dataScope || 'own_records',
      customGrantedPermissions: newUserData.customGrantedPermissions || [],
      customRevokedPermissions: [],
      lastActive: 'Never',
      updatedAt: 'Just now',
      updatedBy: 'Sweet Ali',
    };

    setUsers((prev) => [createdUser, ...prev]);
    setIsAddUserModalOpen(false);
    setNewUserStep(1);

    // Add Audit Log
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: 'Just now',
        performedBy: 'Sweet Ali (Owner)',
        targetUserName: createdUser.name,
        targetUserRole: baseRoles.find((r) => r.id === createdUser.baseRoleId)?.name || 'Staff',
        actionType: 'user_created',
        addedPermissions: [`Initial assignment with role ${baseRoles.find((r) => r.id === createdUser.baseRoleId)?.name}`],
        removedPermissions: [],
        notes: `New staff member onboarded and assigned access to ${createdUser.allowedBranchIds.length} branch(es).`,
      },
      ...prev,
    ]);

    toast.success(
      isBangla
        ? `নতুন কর্মী ${createdUser.name} তৈরি ও প্রবেশাধিকার সেট করা হয়েছে!`
        : `User ${createdUser.name} created and access permissions assigned!`
    );
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-20">
      {/* ─── Top Header & Primary Navigation ──────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-primary" />
            <span>{isBangla ? 'রোল ও পারমিশন' : 'Roles & Permissions'}</span>
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {isBangla
              ? 'ব্যবসার ধরন অনুযায়ী রোলে অনুমতি কাস্টমাইজ করুন এবং নির্দিষ্ট ব্যবহারকারীদের জন্য ডেটা অ্যাক্সেস নিয়ন্ত্রণ করুন।'
              : 'Customize roles with business-specific permissions and control data access for individual users.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={handleOpenAddRole}
            className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold h-10 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            {isBangla ? 'নতুন রোল যোগ' : 'Add Role'}
          </Button>
        </div>
      </div>

      {/* ─── ROLES & PERMISSIONS TABLE ────────────────────────────────────── */}
      <div className="space-y-4 pt-1">
        {/* Search & Filter Toolbar */}
        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={
                isBangla
                  ? 'রোলের নাম বা বিবরণ দিয়ে খুঁজুন...'
                  : 'Search roles by name or description...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl text-xs bg-background border-border"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Role Type Filter */}
            <select
              value={roleTypeFilter}
              onChange={(e) => setRoleTypeFilter(e.target.value as any)}
              className="h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium text-foreground cursor-pointer focus:outline-none"
            >
              <option value="all">{isBangla ? 'সকল ভূমিকা (All Roles)' : 'All Roles'}</option>
              <option value="system">{isBangla ? 'সিস্টেম রোল (System Roles)' : 'System Roles'}</option>
              <option value="custom">{isBangla ? 'কাস্টম রোল (Custom Roles)' : 'Custom Roles'}</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium text-foreground cursor-pointer focus:outline-none"
            >
              <option value="all">{isBangla ? 'সকল স্ট্যাটাস (All Status)' : 'All Status'}</option>
              <option value="active">{isBangla ? 'সক্রিয় (Active)' : 'Active'}</option>
              <option value="inactive">{isBangla ? 'নিষ্ক্রিয় (Inactive)' : 'Inactive'}</option>
            </select>

            {(searchQuery || roleTypeFilter !== 'all' || statusFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setRoleTypeFilter('all');
                  setStatusFilter('all');
                }}
                className="text-xs text-muted-foreground hover:text-foreground h-10 px-2.5 rounded-xl cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                {isBangla ? 'রিসেট' : 'Reset'}
              </Button>
            )}
          </div>
        </div>

        {/* Roles Table */}
        <div className="rounded-2xl bg-card border border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-border text-muted-foreground font-semibold tracking-wider uppercase text-[11px]">
                  <th className="py-3.5 px-4 font-semibold text-muted-foreground">{isBangla ? 'রোলের নাম' : 'ROLE NAME'}</th>
                  <th className="py-3.5 px-4 font-semibold text-muted-foreground">{isBangla ? 'মডিউল ও পারমিশন' : 'MODULES & PERMISSIONS'}</th>
                  <th className="py-3.5 px-4 font-semibold text-muted-foreground">{isBangla ? 'স্ট্যাটাস' : 'STATUS'}</th>
                  <th className="py-3.5 px-4 font-semibold text-muted-foreground">{isBangla ? 'নিয়োজিত কর্মী' : 'ASSIGNED USERS'}</th>
                  <th className="py-3.5 px-4 font-semibold text-muted-foreground text-right">{isBangla ? 'অ্যাকশন' : 'ACTIONS'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredRoles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="font-semibold text-sm">
                        {isBangla ? 'কোনো রোল পাওয়া যায়নি' : 'No roles found matching filter criteria'}
                      </p>
                      <p className="text-xs mt-1">
                        {isBangla ? 'অনুগ্রহ করে ফিল্টার বা সার্চ পরিবর্তন করুন।' : 'Try resetting your search query or filters.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredRoles.map((role) => {
                    const assignedUsers = users.filter((u) => u.baseRoleId === role.id);
                    const coveredModules = ERP_MODULES.filter((m) =>
                      m.permissions.some((p) => role.permissionIds.includes(p.id))
                    );
                    const firstUser = assignedUsers[0];
                    const initials = firstUser ? getStaffInitials(firstUser.name) : 'NA';

                    return (
                      <tr key={role.id} className="hover:bg-muted/20 transition-colors">
                        {/* 1. ROLE NAME */}
                        <td className="py-4 px-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs"
                              style={{ backgroundColor: role.color }}
                            >
                              <Crown className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-foreground">
                                  {isBangla ? role.nameBn : role.name}
                                </span>

                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 truncate">
                                {isBangla ? role.descriptionBn : role.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* 2. MODULES & PERMISSIONS */}
                        <td className="py-4 px-4 align-middle">
                          <div className="flex flex-col gap-1.5">
                            <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                              <span>
                                {coveredModules.length} / {ERP_MODULES.length} {isBangla ? 'মডিউল' : 'Modules'}
                              </span>
                              <span className="text-muted-foreground/60 font-normal">•</span>
                              <span>
                                {role.permissionIds.length} {isBangla ? 'অনুমতি' : 'Permissions'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {coveredModules.slice(0, 3).map((m) => (
                                <span
                                  key={m.id}
                                  className="inline-flex items-center gap-1 px-1 py-1 rounded-md text-[11px] font-medium bg-muted/40 text-foreground/85 border border-border/50"
                                >
                                  {getModuleIcon(m.id)}
                                  <span>{getModuleShortName(m, isBangla)}</span>
                                </span>
                              ))}
                              {coveredModules.length > 3 && (
                                <span className="inline-flex items-center justify-center  py-0.5 rounded-md text-[10px] leading-tight font-medium bg-muted/40 text-muted-foreground border border-border/50">
                                  <span>+{coveredModules.length - 3} {isBangla ? 'আরো' : 'More'}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 3. STATUS */}
                        <td className="py-4 px-4 align-middle">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                              <span
                                className={cn(
                                  "w-2 h-2 rounded-full shrink-0",
                                  role.isSystemProtected ? "bg-purple-500" : "bg-emerald-500"
                                )}
                              />
                              <span>
                                {isBangla
                                  ? role.isSystemProtected
                                    ? 'Active (Protected)'
                                    : 'Active (Custom)'
                                  : role.isSystemProtected
                                  ? 'Active (Protected)'
                                  : 'Active (Custom)'}
                              </span>
                            </div>
                            {/* <span className="text-xs text-muted-foreground">
                              {role.defaultDataScope === 'entire_business'
                                ? (isBangla ? 'Entire Business' : 'Entire Business')
                                : role.defaultDataScope === 'assigned_branches'
                                ? (isBangla ? 'Assigned Branches' : 'Assigned Branches')
                                : role.defaultDataScope === 'own_records'
                                ? (isBangla ? 'Own Records' : 'Own Records')
                                : (isBangla ? 'Own Department' : 'Own Department')}
                            </span> */}
                          </div>
                        </td>

                        {/* 4. ASSIGNED USERS */}
                        <td className="py-4 px-4 align-middle">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              {/* <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                                {initials}
                              </div> */}
                              <span className="font-bold text-xs text-foreground">
                                {assignedUsers.length} {isBangla ? 'staff' : 'staff'}
                              </span>
                            </div>
                            {/* <span className="text-xs text-muted-foreground line-clamp-1">
                              {firstUser
                                ? (isBangla ? firstUser.nameBn || firstUser.name : firstUser.name)
                                : (isBangla ? 'Unassigned' : 'Unassigned')}
                              {assignedUsers.length > 1 && ` +${assignedUsers.length - 1}`}
                            </span> */}
                          </div>
                        </td>

                        {/* 5. ACTIONS */}
                        <td className="py-4 px-4 align-middle text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewStaff(role)}
                              className="h-8 px-3 rounded-full border-border/80 hover:border-border bg-background/50 hover:bg-muted/50 text-xs font-medium text-foreground flex items-center gap-1.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-sky-400" />
                              <span>{isBangla ? 'View' : 'View'}</span>
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => handleEditRole(role)}
                              className="h-8 px-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-white" />
                              <span>{isBangla ? 'Edit' : 'Edit'}</span>
                            </Button>

                             <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteRole(role)}
                                className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                title={isBangla ? 'মুছে ফেলুন' : 'Delete Role'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── ROLE CONFIGURATION & PERMISSION MODAL ───────────────────────── */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="max-w-4xl w-[94vw] max-h-[90vh] flex flex-col p-0 gap-0 rounded-2xl bg-card border-border overflow-hidden">
          {editingRole && (
            <>
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-border bg-muted/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: editingRole.color }} />
                  <div>
                    <h2 className="text-lg font-extrabold text-foreground">
                      {editingRole.name ? (isBangla ? editingRole.nameBn || editingRole.name : editingRole.name) : (isBangla ? 'নতুন রোল তৈরি' : 'Create New Role')}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {isBangla ? 'মডিউল ও পারমিশন কনফিগার করুন' : 'Configure role details and granular permissions'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsRoleModalOpen(false)}
                    className="rounded-xl border-border text-xs font-semibold h-9 hover:bg-muted cursor-pointer"
                  >
                    {isBangla ? 'বাতিল' : 'Cancel'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveRole}
                    className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold h-9 shadow-sm cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 mr-1" />
                    {isBangla ? 'সংরক্ষণ করুন' : 'Save Role'}
                  </Button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                {/* Role Details Form */}
                <div className="p-4 rounded-2xl bg-muted/20 border border-border/80 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-foreground mb-1 block">
                        {isBangla ? 'রোলের নাম (English)' : 'Role Name (English)'}
                      </Label>
                      <Input
                        value={editingRole.name}
                        onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                        placeholder="e.g. Area Sales Officer"
                        className="h-9 text-xs rounded-xl bg-background"
                        disabled={editingRole.isSystemProtected}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-foreground mb-1 block">
                        {isBangla ? 'রোলের নাম (বাংলা)' : 'Role Name (Bengali)'}
                      </Label>
                      <Input
                        value={editingRole.nameBn}
                        onChange={(e) => setEditingRole({ ...editingRole, nameBn: e.target.value })}
                        placeholder="যেমন: এরিয়া সেলস অফিসার"
                        className="h-9 text-xs rounded-xl bg-background"
                        disabled={editingRole.isSystemProtected}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-foreground mb-1 block">
                      {isBangla ? 'বিবরণ' : 'Description'}
                    </Label>
                    <Input
                      value={editingRole.description}
                      onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                      placeholder="Brief summary of duties and responsibilities"
                      className="h-9 text-xs rounded-xl bg-background"
                    />
                  </div>
                </div>

                {/* Modules & Permissions Matrix */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <span>{isBangla ? 'মডিউল ভিত্তিক অনুমতি' : 'Module Permissions'}</span>
                    </h3>
                    <span className="text-xs text-muted-foreground font-mono">
                      {editingRolePermissions.length} / {ALL_PERMISSION_IDS.length} {isBangla ? 'অনুমতি সক্রিয়' : 'enabled'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {ERP_MODULES.map((module) => {
                      const modPermIds = module.permissions.map((p) => p.id);
                      const enabledCount = modPermIds.filter((id) => editingRolePermissions.includes(id)).length;
                      const allEnabled = enabledCount === modPermIds.length;

                      return (
                        <div key={module.id} className="rounded-xl border border-border bg-card overflow-hidden">
                          <div className="p-3 bg-muted/30 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="font-bold text-xs text-foreground">{isBangla ? module.nameBn : module.name}</span>
                              <span className="text-[10px] text-muted-foreground">({enabledCount} / {modPermIds.length})</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleAllModulePermissions(module, !allEnabled)}
                              className="h-7 text-[11px] font-semibold text-primary hover:bg-primary/10 cursor-pointer"
                            >
                              {allEnabled ? (isBangla ? 'সব বাতিল' : 'Deselect All') : (isBangla ? 'সব নির্বাচন' : 'Select All')}
                            </Button>
                          </div>
                          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {module.permissions.map((perm) => {
                              const isChecked = editingRolePermissions.includes(perm.id);
                              return (
                                <label
                                  key={perm.id}
                                  className={cn(
                                    'flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors',
                                    isChecked
                                      ? 'bg-primary/5 border-primary/30 text-foreground'
                                      : 'border-border/60 text-muted-foreground hover:bg-muted/30'
                                  )}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleRolePermission(perm.id)}
                                    className="mt-0.5 rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                                  />
                                  <div>
                                    <span className="font-semibold block">{isBangla ? perm.nameBn : perm.name}</span>
                                    <span className="text-[10px] opacity-75 line-clamp-1">{perm.description}</span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── VIEW ASSIGNED STAFF MODAL ───────────────────────────────────── */}
      <Dialog open={isStaffModalOpen} onOpenChange={setIsStaffModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl bg-card border-border p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-bold text-base">
              <Users className="w-5 h-5 text-primary" />
              <span>
                {viewStaffRole ? (isBangla ? `${viewStaffRole.nameBn} - নিয়োজিত কর্মী` : `Staff Assigned to ${viewStaffRole.name}`) : 'Assigned Staff'}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isBangla
                ? 'এই ভূমিকায় নিযুক্ত সকল কর্মচারীদের তালিকা।'
                : 'All employees currently assigned this baseline role.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pt-2">
            {viewStaffRole &&
              (() => {
                const assigned = users.filter((u) => u.baseRoleId === viewStaffRole.id);
                if (assigned.length === 0) {
                  return (
                    <div className="py-8 text-center text-muted-foreground text-xs">
                      <UserX className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p>{isBangla ? 'এই রোলে কোনো কর্মী নিযুক্ত নেই।' : 'No staff members are assigned to this role.'}</p>
                    </div>
                  );
                }
                return assigned.map((u) => (
                  <div key={u.id} className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                          {u.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-xs text-foreground">{isBangla ? u.nameBn : u.name}</div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                          <span>{u.designation}</span>
                          <span>•</span>
                          <span>{u.department}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                      {u.status === 'active' ? (isBangla ? 'সক্রিয়' : 'Active') : (isBangla ? 'নিষ্ক্রিয়' : 'Inactive')}
                    </Badge>
                  </div>
                ));
              })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── DEDICATED FULL-WORKSPACE MANAGE USER ACCESS MODAL ─────────────── */}
      <Dialog open={isManageAccessOpen} onOpenChange={setIsManageAccessOpen}>
        <DialogContent className="max-w-6xl w-[96vw] max-h-[92vh] flex flex-col p-0 gap-0 rounded-2xl bg-card border-border overflow-hidden">
          {draftUser && (
            <>
              {/* Modal Top Header */}
              <div className="p-4 sm:p-5 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <Avatar className="w-11 h-11 border-2 border-primary/20 shadow-xs">
                    <AvatarFallback className="bg-primary/10 text-primary font-black text-sm">
                      {draftUser.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-extrabold text-foreground">
                        {isBangla ? draftUser.nameBn : draftUser.name}
                      </h2>
                      {draftUser.isOwner && (
                        <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px]">
                          Owner
                        </Badge>
                      )}
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full inline-block',
                          draftUser.status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground'
                        )}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="font-mono">{draftUser.employeeId}</span>
                      <span>•</span>
                      <span>{draftUser.department}</span>
                      <span>•</span>
                      <span>{draftUser.designation}</span>
                      <span>•</span>
                      <span>{draftUser.email}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetAllToRole}
                    className="rounded-xl border-border text-xs font-semibold h-9 hover:bg-muted cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    {isBangla ? 'ভূমিকা অনুযায়ী রিসেট' : 'Reset to Role'}
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleSaveDraftChanges}
                    className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold h-9 shadow-sm cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 mr-1" />
                    {isBangla ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}
                  </Button>
                </div>
              </div>

              {/* Live Access Summary Bar */}
              <div className="px-4 py-2.5 bg-muted/40 border-b border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground font-medium">{isBangla ? 'অ্যাক্সেস লেভেল' : 'Access Level'}:</span>
                    {draftUser.isFullSystemAccess ? (
                      <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px] font-bold">
                        <Crown className="w-3 h-3 mr-1" /> Full System Access
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] font-bold">
                        {draftUser.accessLevel.replace('_', ' ').toUpperCase()}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground font-medium">{isBangla ? 'শাখা সীমা' : 'Branches'}:</span>
                    <span className="font-bold text-foreground">
                      {draftUser.branchScopeMode === 'all' || draftUser.isFullSystemAccess
                        ? `All (${HRM_BRANCHES.length})`
                        : `${draftUser.allowedBranchIds.length} of ${HRM_BRANCHES.length}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground font-medium">{isBangla ? 'অনুমতি সংখ্যা' : 'Permissions'}:</span>
                    <span className="font-bold text-foreground">{draftEffectivePermissions.size} / {ALL_PERMISSION_IDS.length}</span>
                  </div>

                  {(draftUser.customGrantedPermissions.length > 0 || draftUser.customRevokedPermissions.length > 0) && (
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-emerald-500 font-bold">+{draftUser.customGrantedPermissions.length} Overrides</span>
                      {draftUser.customRevokedPermissions.length > 0 && (
                        <span className="text-rose-500 font-bold">-{draftUser.customRevokedPermissions.length} Revoked</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                  <span>Last updated: {draftUser.updatedAt}</span>
                  <span>by {draftUser.updatedBy}</span>
                </div>
              </div>

              {/* Modal Body: 3-Zone Workspace Layout */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* ── LEFT & CENTER: Configuration Settings (8 cols) ─────────── */}
                <div className="lg:col-span-8 space-y-6">
                  {/* SECTION 1: Base Role & Full System Access Toggle */}
                  <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-primary" />
                        <h3 className="font-bold text-sm text-foreground">
                          {isBangla ? '১. প্রাথমিক ভূমিকা ও পূর্ণ অ্যাক্সেস মোড' : '1. Base Role & Full System Access'}
                        </h3>
                      </div>

                      {/* Full System Access Switch */}
                      <div className="flex items-center gap-2">
                        <Label htmlFor="full-access-toggle" className="text-xs font-bold text-foreground cursor-pointer">
                          {isBangla ? 'পূর্ণ সিস্টেম অ্যাক্সেস (Full Access)' : 'Full System Access'}
                        </Label>
                        <Switch
                          id="full-access-toggle"
                          checked={draftUser.isFullSystemAccess}
                          onCheckedChange={handleToggleFullSystemAccess}
                        />
                      </div>
                    </div>

                    {draftUser.isFullSystemAccess ? (
                      <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-700 dark:text-purple-300 flex items-start gap-2.5">
                        <Crown className="w-4 h-4 shrink-0 mt-0.5 text-purple-600" />
                        <div>
                          <p className="font-bold">{isBangla ? 'এই কর্মীকে পূর্ণ আনরেস্ট্রিক্টেড অ্যাক্সেস দেওয়া হয়েছে।' : 'Unrestricted Full Enterprise Access Active'}</p>
                          <p className="text-[11px] opacity-90 mt-0.5">
                            {isBangla
                              ? 'তিনি সকল শাখা, আর্থিক হিসাব, বেতন ও নিরাপত্তা সেটিংস দেখতে ও পরিবর্তন করতে পারবেন।'
                              : 'This employee has unrestricted visibility across all branches, financial balances, payroll, and configuration.'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                            {isBangla ? 'বেস রোল টেমপ্লেট নির্বাচন করুন' : 'Select Base Role Template'}
                          </label>
                          <select
                            value={draftUser.baseRoleId}
                            onChange={(e) => handleBaseRoleChange(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-bold text-foreground cursor-pointer focus:outline-none"
                          >
                            {baseRoles.map((r) => (
                              <option key={r.id} value={r.id}>
                                {isBangla ? r.nameBn : r.name} ({r.permissionIds.length} Perms)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                            {isBangla ? 'ব্যবসায়িক ডেটা দৃশ্যমানতার সীমা (Data Scope)' : 'Business Data Scope'}
                          </label>
                          <select
                            value={draftUser.dataScope}
                            onChange={(e) => setDraftUser({ ...draftUser, dataScope: e.target.value as any })}
                            className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium text-foreground cursor-pointer focus:outline-none"
                          >
                            <option value="entire_business">{isBangla ? 'সমগ্র প্রতিষ্ঠান (Entire Business)' : 'Entire Business'}</option>
                            <option value="assigned_branches">{isBangla ? 'অনুমোদিত শাখাসমূহ (Assigned Branches)' : 'Assigned Branches Only'}</option>
                            <option value="own_department">{isBangla ? 'নিজ ডিপার্টমেন্ট (Own Department)' : 'Own Department Only'}</option>
                            <option value="own_records">{isBangla ? 'শুধুমাত্র নিজের তৈরি রেকর্ড (Own Records)' : 'Own Records & Assigned Parties'}</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SECTION 2: Branch Access Scope (VERY IMPORTANT) */}
                  <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-500" />
                        <div>
                          <h3 className="font-bold text-sm text-foreground">
                            {isBangla ? '২. শাখা প্রবেশাধিকার (Branch Access Scope)' : '2. Branch Access Scope'}
                          </h3>
                          <p className="text-[11px] text-muted-foreground">
                            {isBangla
                              ? 'কর্মচারী শুধুমাত্র নির্বাচিত শাখার ডেটা ও লেনদেন পরিচালনা করতে পারবেন।'
                              : 'Employee will only be able to view and manage data belonging to selected branches.'}
                          </p>
                        </div>
                      </div>

                      {/* All vs Selected Switch */}
                      {!draftUser.isFullSystemAccess && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={draftUser.branchScopeMode === 'all' ? 'default' : 'outline'}
                            onClick={() => handleToggleAllBranches(true)}
                            className="h-7 text-[11px] rounded-lg cursor-pointer px-2.5 font-bold"
                          >
                            {isBangla ? 'সকল শাখা' : 'All Branches'}
                          </Button>
                          <Button
                            size="sm"
                            variant={draftUser.branchScopeMode === 'selected' ? 'default' : 'outline'}
                            onClick={() => handleToggleAllBranches(false)}
                            className="h-7 text-[11px] rounded-lg cursor-pointer px-2.5 font-bold"
                          >
                            {isBangla ? 'নির্দিষ্ট শাখা' : 'Selected Only'}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Branch Checkboxes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                      {HRM_BRANCHES.map((branch) => {
                        const isAssigned = draftUser.branchScopeMode === 'all' || draftUser.isFullSystemAccess || draftUser.allowedBranchIds.includes(branch.id);
                        return (
                          <div
                            key={branch.id}
                            onClick={() => handleToggleBranch(branch.id)}
                            className={cn(
                              'p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer select-none',
                              isAssigned
                                ? 'bg-emerald-500/5 border-emerald-500/40 text-foreground shadow-xs'
                                : 'bg-muted/20 border-border text-muted-foreground opacity-70 hover:opacity-100'
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={cn(
                                  'w-4 h-4 rounded-md border flex items-center justify-center transition-colors',
                                  isAssigned ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-muted-foreground/40'
                                )}
                              >
                                {isAssigned && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className="text-xs font-bold">{branch.name}</span>
                            </div>

                            {isAssigned && (
                              <Badge className="bg-emerald-500/10 text-emerald-600 text-[9px] px-1.5 py-0 border-emerald-500/20">
                                {isBangla ? 'অনুমোদিত' : 'Allowed'}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* SECTION 3: Granular Module Access & Quick Permission Levels */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <div>
                          <h3 className="font-bold text-sm text-foreground">
                            {isBangla ? '৩. মডিউল ও কাস্টম অ্যাকশন পারমিশন' : '3. Module Access & Action Permissions'}
                          </h3>
                          <p className="text-[11px] text-muted-foreground">
                            {isBangla
                              ? 'মডিউল অনুযায়ী কুইক লেভেল নির্ধারণ করুন অথবা বিস্তারিত অ্যাকশন পারমিশন কাস্টমাইজ করুন।'
                              : 'Set quick access levels per module or customize granular action permissions.'}
                          </p>
                        </div>
                      </div>

                      {/* Filter Permissions */}
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder={isBangla ? 'পারমিশন বা মডিউল খুঁজুন...' : 'Search permissions...'}
                          value={permissionModuleSearch}
                          onChange={(e) => setPermissionModuleSearch(e.target.value)}
                          className="h-8 text-xs w-48 rounded-lg bg-background border-border"
                        />
                      </div>
                    </div>

                    {/* Expandable Module Cards */}
                    <div className="space-y-3">
                      {ERP_MODULES.map((module) => {
                        const isExpanded = expandedModuleIds.includes(module.id);
                        const modulePermIds = module.permissions.map((p) => p.id);
                        const grantedCountInModule = modulePermIds.filter((pId) => draftEffectivePermissions.has(pId)).length;
                        const totalInModule = modulePermIds.length;

                        // Check Quick Level State
                        let currentLevel: PermissionLevelType = 'custom';
                        if (grantedCountInModule === 0) currentLevel = 'no_access';
                        else if (grantedCountInModule === totalInModule) currentLevel = 'full_access';
                        else if (
                          grantedCountInModule === module.standardPermissionIds.length &&
                          module.standardPermissionIds.every((id) => draftEffectivePermissions.has(id))
                        ) {
                          currentLevel = 'standard';
                        } else if (
                          grantedCountInModule === module.readOnlyPermissionIds.length &&
                          module.readOnlyPermissionIds.every((id) => draftEffectivePermissions.has(id))
                        ) {
                          currentLevel = 'read_only';
                        }

                        // Filter check
                        if (permissionModuleSearch) {
                          const q = permissionModuleSearch.toLowerCase();
                          const matchMod = module.name.toLowerCase().includes(q) || module.nameBn.includes(q);
                          const matchPerm = module.permissions.some((p) => p.name.toLowerCase().includes(q) || p.nameBn.includes(q));
                          if (!matchMod && !matchPerm) return null;
                        }

                        return (
                          <div
                            key={module.id}
                            className={cn(
                              'rounded-2xl border transition-all overflow-hidden bg-card',
                              grantedCountInModule > 0 ? 'border-border shadow-xs' : 'border-border/60 opacity-80'
                            )}
                          >
                            {/* Module Header Bar */}
                            <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
                              <div
                                onClick={() => {
                                  if (isExpanded) {
                                    setExpandedModuleIds(expandedModuleIds.filter((id) => id !== module.id));
                                  } else {
                                    setExpandedModuleIds([...expandedModuleIds, module.id]);
                                  }
                                }}
                                className="flex items-center gap-3 cursor-pointer select-none flex-1"
                              >
                                <div className="p-1 rounded-md text-muted-foreground hover:bg-muted">
                                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </div>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-foreground">
                                      {isBangla ? module.nameBn : module.name}
                                    </span>
                                    <Badge
                                      variant={grantedCountInModule === totalInModule ? 'default' : grantedCountInModule > 0 ? 'secondary' : 'outline'}
                                      className="text-[10px] py-0 px-1.5 font-bold"
                                    >
                                      {grantedCountInModule} / {totalInModule} {isBangla ? 'অনুমতি' : 'granted'}
                                    </Badge>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground hidden sm:block">
                                    {isBangla ? module.descriptionBn : module.description}
                                  </p>
                                </div>
                              </div>

                              {/* Quick Level Selector Buttons */}
                              {!draftUser.isFullSystemAccess && (
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => handleModuleQuickLevelChange(module, 'no_access')}
                                    className={cn(
                                      'px-2 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer',
                                      currentLevel === 'no_access'
                                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-600'
                                        : 'bg-background border-border text-muted-foreground hover:bg-muted'
                                    )}
                                  >
                                    {isBangla ? 'নো অ্যাক্সেস' : 'None'}
                                  </button>

                                  <button
                                    onClick={() => handleModuleQuickLevelChange(module, 'read_only')}
                                    className={cn(
                                      'px-2 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer',
                                      currentLevel === 'read_only'
                                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-600'
                                        : 'bg-background border-border text-muted-foreground hover:bg-muted'
                                    )}
                                  >
                                    {isBangla ? 'রিড অনলি' : 'Read Only'}
                                  </button>

                                  <button
                                    onClick={() => handleModuleQuickLevelChange(module, 'standard')}
                                    className={cn(
                                      'px-2 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer',
                                      currentLevel === 'standard'
                                        ? 'bg-primary/10 border-primary/30 text-primary'
                                        : 'bg-background border-border text-muted-foreground hover:bg-muted'
                                    )}
                                  >
                                    {isBangla ? 'স্ট্যান্ডার্ড' : 'Standard'}
                                  </button>

                                  <button
                                    onClick={() => handleModuleQuickLevelChange(module, 'full_access')}
                                    className={cn(
                                      'px-2 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer',
                                      currentLevel === 'full_access'
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                                        : 'bg-background border-border text-muted-foreground hover:bg-muted'
                                    )}
                                  >
                                    {isBangla ? 'ফুল' : 'Full'}
                                  </button>

                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleResetModuleToRole(module)}
                                    className="h-6 w-6 p-0 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                                    title={isBangla ? 'ভূমিকা অনুযায়ী রিসেট' : 'Reset to Role'}
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>

                            {/* Expanded Granular Permissions Grid */}
                            {isExpanded && (
                              <div className="p-3.5 bg-background border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {module.permissions.map((perm) => {
                                  const isGranted = draftEffectivePermissions.has(perm.id);
                                  const isCustomGranted = draftUser.customGrantedPermissions.includes(perm.id);
                                  const isCustomRevoked = draftUser.customRevokedPermissions.includes(perm.id);
                                  const isRoleInherited = activeRoleDefinition?.permissionIds.includes(perm.id);

                                  return (
                                    <div
                                      key={perm.id}
                                      onClick={() => handlePermissionToggle(perm.id)}
                                      className={cn(
                                        'p-2.5 rounded-xl border transition-all flex items-start justify-between gap-2 select-none cursor-pointer',
                                        isGranted
                                          ? 'bg-primary/5 border-primary/20 text-foreground'
                                          : 'bg-muted/10 border-border/60 text-muted-foreground hover:bg-muted/30'
                                      )}
                                    >
                                      <div className="flex items-start gap-2.5">
                                        <div
                                          className={cn(
                                            'w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                                            isGranted ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/40'
                                          )}
                                        >
                                          {isGranted && <Check className="w-3 h-3 stroke-[3]" />}
                                        </div>

                                        <div>
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-bold text-foreground">
                                              {isBangla ? perm.nameBn : perm.name}
                                            </span>
                                            {perm.isSensitive && (
                                              <span title="Sensitive Action" className="text-rose-500 font-bold text-[10px] flex items-center gap-0.5">
                                                <Lock className="w-3 h-3" />
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-[10px] text-muted-foreground mt-0.5">
                                            {perm.description}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Inheritance & Override Badges */}
                                      <div className="shrink-0">
                                        {isCustomGranted && (
                                          <Badge className="bg-emerald-500/10 text-emerald-600 text-[8px] font-bold px-1 py-0 border-emerald-500/20">
                                            + Custom
                                          </Badge>
                                        )}
                                        {isCustomRevoked && (
                                          <Badge className="bg-rose-500/10 text-rose-600 text-[8px] font-bold px-1 py-0 border-rose-500/20">
                                            - Revoked
                                          </Badge>
                                        )}
                                        {!isCustomGranted && !isCustomRevoked && isRoleInherited && isGranted && (
                                          <span className="text-[9px] text-muted-foreground font-mono">
                                            [Role]
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ── RIGHT PANEL: Real-time "Effective Access Preview" (4 cols) ── */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="p-4 rounded-2xl bg-card border border-border shadow-xs sticky top-2 space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <h4 className="font-extrabold text-xs tracking-wider uppercase text-foreground">
                          {isBangla ? 'কার্যকর প্রবেশাধিকার সারাংশ' : 'Effective Access Summary'}
                        </h4>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        Live Preview
                      </Badge>
                    </div>

                    {/* Question 1: Who is this employee? */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        {isBangla ? '১. কর্মী পরিচিতি (Who is this employee?)' : '1. Who is this employee?'}
                      </span>
                      <p className="text-xs font-bold text-foreground">
                        {draftUser.name} — <span className="text-primary">{activeRoleDefinition?.name || 'Custom'}</span>
                      </p>
                    </div>

                    {/* Question 2: Where can they work? */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        {isBangla ? '২. কোন শাখায় কাজ করতে পারবেন? (Where?)' : '2. Where can they work?'}
                      </span>
                      {draftUser.branchScopeMode === 'all' || draftUser.isFullSystemAccess ? (
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" /> All Branches Across Business
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {draftUser.allowedBranchIds.map((bId) => (
                            <Badge key={bId} variant="secondary" className="text-[10px]">
                              {HRM_BRANCHES.find((b) => b.id === bId)?.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Question 3: What modules can they access? */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        {isBangla ? '৩. কোন কোন মডিউল সক্রিয়? (What modules?)' : '3. What can they access?'}
                      </span>
                      <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                        {ERP_MODULES.map((m) => {
                          const count = m.permissions.filter((p) => draftEffectivePermissions.has(p.id)).length;
                          if (count === 0) {
                            return (
                              <div key={m.id} className="flex items-center justify-between text-[11px] text-muted-foreground py-0.5">
                                <span className="line-through opacity-60">{m.name}</span>
                                <span className="text-[9px] text-rose-500 font-bold">Blocked</span>
                              </div>
                            );
                          }
                          return (
                            <div key={m.id} className="flex items-center justify-between text-[11px] py-0.5">
                              <span className="font-semibold text-foreground flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-500" />
                                {m.name}
                              </span>
                              <span className="text-[10px] font-mono text-muted-foreground font-bold">
                                {count}/{m.permissions.length}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Question 4: Sensitive Actions Safeguard */}
                    <div className="pt-2 border-t border-border space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        {isBangla ? 'সংবেদনশীল পারমিশন চেক' : 'Sensitive Actions Enabled'}
                      </span>
                      {ALL_SENSITIVE_PERMISSION_IDS.filter((id) => draftEffectivePermissions.has(id)).length === 0 ? (
                        <p className="text-[11px] text-muted-foreground italic">
                          No high-risk sensitive permissions enabled.
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {ALL_SENSITIVE_PERMISSION_IDS.filter((id) => draftEffectivePermissions.has(id)).map((sId) => (
                            <div key={sId} className="flex items-center gap-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                              <Lock className="w-2.5 h-2.5" />
                              <span>{PERMISSION_BY_ID_MAP.get(sId)?.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── PERMISSION DIFF / SAFETY REVIEW MODAL ───────────────────────── */}
      <AlertDialog open={isDiffConfirmOpen} onOpenChange={setIsDiffConfirmOpen}>
        <AlertDialogContent className="max-w-lg rounded-2xl bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground font-bold">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span>{isBangla ? 'অ্যাক্সেস পরিবর্তন নিশ্চিত করুন' : 'Confirm Access Control Changes'}</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              {isBangla
                ? `${draftUser?.name} এর জন্য নিম্নলিখিত অনুমতি ও শাখা পরিবর্তন কার্যকর হতে চলেছে:`
                : `The following access and permission modifications will be applied to ${draftUser?.name}:`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 py-2 text-xs max-h-60 overflow-y-auto">
            {/* Added Permissions */}
            {permissionDiff.added.length > 0 && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 space-y-1">
                <span className="font-bold text-[11px] block">
                  + {permissionDiff.added.length} {isBangla ? 'নতুন অনুমতি যুক্ত' : 'Permissions Added'}:
                </span>
                <ul className="list-disc list-inside text-[11px] space-y-0.5">
                  {permissionDiff.added.map((p) => (
                    <li key={p.id}>
                      {MODULE_BY_PERMISSION_ID_MAP.get(p.id)?.name} → {p.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Removed Permissions */}
            {permissionDiff.removed.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 space-y-1">
                <span className="font-bold text-[11px] block">
                  - {permissionDiff.removed.length} {isBangla ? 'অনুমতি প্রত্যাহার' : 'Permissions Revoked'}:
                </span>
                <ul className="list-disc list-inside text-[11px] space-y-0.5">
                  {permissionDiff.removed.map((p) => (
                    <li key={p.id}>
                      {MODULE_BY_PERMISSION_ID_MAP.get(p.id)?.name} → {p.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* High-risk sensitive warning */}
            {permissionDiff.sensitiveGranted.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-bold text-[11px]">{isBangla ? 'উচ্চ ঝুঁকিপূর্ণ সংবেদনশীল অনুমতি!' : 'High-Privilege Sensitive Permissions!'}</p>
                  <p className="text-[10px] mt-0.5">
                    {permissionDiff.sensitiveGranted.map((p) => p.name).join(', ')}
                  </p>
                </div>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl cursor-pointer text-xs">
              {isBangla ? 'বাতিল' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAndApplyChanges}
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold cursor-pointer"
            >
              {isBangla ? 'নিশ্চিত ও সংরক্ষণ করুন' : 'Confirm & Save Access'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── FULL SYSTEM ACCESS WARNING DIALOG ───────────────────────────── */}
      <AlertDialog open={isFullAccessWarningOpen} onOpenChange={setIsFullAccessWarningOpen}>
        <AlertDialogContent className="max-w-md rounded-2xl bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-500 font-bold">
              <Crown className="w-5 h-5" />
              <span>{isBangla ? 'পূর্ণ সিস্টেম অ্যাক্সেস প্রদান করবেন?' : 'Grant Full System Access?'}</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {isBangla
                ? 'পূর্ণ সিস্টেম অ্যাক্সেস এই কর্মচারীকে সকল শাখা, সংবেদনশীল আর্থিক লেনদেন, কর্মী বেতন ও নিরাপত্তা সেটিংস নিয়ন্ত্রণের অবাধ ক্ষমতা দেবে। আপনি কি নিশ্চিত?'
                : 'Full system access grants this user unrestricted visibility across ALL branches, financial ledgers, salary calculations, and user permissions. Are you sure you want to proceed?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl cursor-pointer text-xs">
              {isBangla ? 'বাতিল' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmGrantFullSystemAccess}
              className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer"
            >
              {isBangla ? 'হ্যাঁ, পূর্ণ অ্যাক্সেস দিন' : 'Grant Full Access'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── QUICK PREVIEW DRAWER / MODAL ─────────────────────────────────── */}
      <Dialog open={isQuickPreviewDrawerOpen} onOpenChange={setIsQuickPreviewDrawerOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-card border-border p-5">
          {previewingUser && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-foreground font-bold">
                  <Eye className="w-4 h-4 text-primary" />
                  <span>{previewingUser.name}&apos;s Effective Access</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {previewingUser.designation} • {previewingUser.department}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Branch Access</span>
                  <p className="font-bold text-foreground">
                    {previewingUser.branchScopeMode === 'all'
                      ? 'All Branches (Enterprise)'
                      : previewingUser.allowedBranchIds.map((id) => HRM_BRANCHES.find((b) => b.id === id)?.name).join(', ')}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Base Role</span>
                  <p className="font-bold text-foreground">
                    {baseRoles.find((r) => r.id === previewingUser.baseRoleId)?.name || 'Custom'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Effective Permissions</span>
                  <p className="font-bold text-primary">
                    {computeEffectivePermissions(previewingUser, baseRoles).size} of {ALL_PERMISSION_IDS.length} total permissions enabled
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={() => {
                    setIsQuickPreviewDrawerOpen(false);
                    handleOpenManageAccess(previewingUser);
                  }}
                  className="w-full rounded-xl bg-primary text-primary-foreground font-bold text-xs h-9 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 mr-1" />
                  {isBangla ? 'পূর্ণ অ্যাক্সেস কনফিগার করুন' : 'Open Full Access Editor'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── ADD NEW USER / ONBOARDING WIZARD MODAL ───────────────────────── */}
      <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
        <DialogContent className="max-w-xl rounded-2xl bg-card border-border p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-bold">
              <UserPlus className="w-5 h-5 text-primary" />
              <span>{isBangla ? 'নতুন ব্যবহারকারী যোগ ও প্রবেশাধিকার নির্ধারণ' : 'Add User & Assign Access'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isBangla
                ? 'কর্মচারীর তথ্য দিন, বেস রোল ও শাখা নির্বাচন করে সহজে অ্যাক্সেস বরাদ্দ করুন।'
                : 'Enter employee profile details, choose a base role template, and select assigned branches.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">{isBangla ? 'নাম (Full Name)' : 'Full Name'} *</Label>
                <Input
                  placeholder="e.g. Rahim Sheikh"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  className="mt-1 h-9 text-xs rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">{isBangla ? 'ইমেইল (Email Address)' : 'Email Address'} *</Label>
                <Input
                  placeholder="e.g. rahim@hellokhata.com"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="mt-1 h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">{isBangla ? 'ফোন নম্বর' : 'Phone Number'}</Label>
                <Input
                  placeholder="01700-000000"
                  value={newUserData.phone}
                  onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                  className="mt-1 h-9 text-xs rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">{isBangla ? 'পদবী (Designation)' : 'Designation'}</Label>
                <Input
                  placeholder="e.g. Sales Executive"
                  value={newUserData.designation}
                  onChange={(e) => setNewUserData({ ...newUserData, designation: e.target.value })}
                  className="mt-1 h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">{isBangla ? 'বেস রোল টেমপ্লেট' : 'Base Role Template'}</Label>
              <select
                value={newUserData.baseRoleId}
                onChange={(e) => setNewUserData({ ...newUserData, baseRoleId: e.target.value })}
                className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background text-xs font-bold text-foreground cursor-pointer focus:outline-none"
              >
                {baseRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {isBangla ? r.nameBn : r.name} ({r.permissionIds.length} Permissions)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold mb-1.5 block">{isBangla ? 'শাখা বরাদ্দ (Branch Allocation)' : 'Branch Allocation'}</Label>
              <div className="grid grid-cols-2 gap-2">
                {HRM_BRANCHES.map((b) => {
                  const isChecked = newUserData.allowedBranchIds?.includes(b.id);
                  return (
                    <div
                      key={b.id}
                      onClick={() => {
                        const current = newUserData.allowedBranchIds || [];
                        const updated = isChecked ? current.filter((id) => id !== b.id) : [...current, b.id];
                        setNewUserData({ ...newUserData, allowedBranchIds: updated.length ? updated : [b.id] });
                      }}
                      className={cn(
                        'p-2.5 rounded-xl border flex items-center justify-between cursor-pointer select-none text-xs',
                        isChecked ? 'bg-primary/10 border-primary/40 text-foreground font-bold' : 'bg-muted/20 border-border text-muted-foreground'
                      )}
                    >
                      <span>{b.name}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-primary" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserModalOpen(false)} className="rounded-xl text-xs cursor-pointer">
              {isBangla ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button onClick={handleCreateNewUser} className="rounded-xl bg-primary text-primary-foreground font-bold text-xs cursor-pointer">
              {isBangla ? 'ব্যবহারকারী তৈরি করুন' : 'Create & Assign Access'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

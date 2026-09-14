// Hello Khata - Navigation Configuration
// হ্যালো খাতা - নেভিগেশন কনফিগারেশন

import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Receipt,
  BarChart3,
  Settings,
  Sparkles,
  FileText,
  Truck,
  RotateCcw,
  CreditCard,
  Tag,
  Bell,
  Plus,
  Landmark,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Coins,
  Wallet,
  UserCog,
  CalendarCheck,
  CalendarOff,
  Banknote,
  ClipboardList,
  Shield,
  UserSquare2,
  FileClock,
  BookPlus,
  Building2,
  SlidersHorizontal,
  ArrowRightLeft,
  BadgeDollarSign,
  UserCheck,
  FileSpreadsheet,
} from "lucide-react";

export interface SubnavItem {
  page: string;
  icon?: any;
  labelKey: string;
  labelBn: string;
}

export interface NavItem {
  labelKey: string;
  labelBn: string;
  icon: any;
  page?: string;
  submenu?: SubnavItem[];
}

export const navGroups: NavItem[] = [
  {
    page: "/",
    icon: LayoutDashboard,
    labelKey: "Dashboard",
    labelBn: "ড্যাশবোর্ড",
  },
  {
    labelKey: "Sales",
    labelBn: "বিক্রি",
    icon: ShoppingCart,
    submenu: [
      {
        page: "/sales/new",
        icon: BookPlus,
        labelKey: "POS",
        labelBn: "নতুন বিক্রয়",
      },
      {
        page: "/sales",
        icon: ShoppingCart,
        labelKey: "Sales List",
        labelBn: "বিক্রয় তালিকা",
      },
      {
        page: "/sales/quotations",
        icon: FileText,
        labelKey: "Quotations",
        labelBn: "কোটেশন",
      },
      {
        page: "/sales/returns",
        icon: RotateCcw,
        labelKey: "Sales Return",
        labelBn: "বিক্রয় ফেরত",
      },
    ],
  },
  {
    labelKey: "Purchases",
    labelBn: "ক্রয়",
    icon: Truck,
    submenu: [
      {
        page: "/purchases",
        icon: Truck,
        labelKey: "Purchase List",
        labelBn: "ক্রয় তালিকা",
      },
      {
        page: "/purchases/returns",
        icon: RotateCcw,
        labelKey: "Purchase Return",
        labelBn: "ক্রয় ফেরত",
      },
    ],
  },
  {
    labelKey: "Parties",
    labelBn: "পার্টি",
    icon: Users,
    submenu: [
      {
        page: "/parties",
        icon: Users,
        labelKey: "Parties List",
        labelBn: "পার্টি তালিকা",
      },
      {
        page: "/parties/payment-in",
        icon: CreditCard,
        labelKey: "Payment In",
        labelBn: "পেমেন্ট ইন",
      },
      {
        page: "/parties/payment-out",
        icon: CreditCard,
        labelKey: "Payment Out",
        labelBn: "পেমেন্ট আউট",
      },
    ],
  },
  {
    labelKey: "Inventory",
    labelBn: "ইনভেন্টরি",
    icon: Package,
    submenu: [
      {
        page: "/inventory",
        icon: Package,
        labelKey: "Inventory List",
        labelBn: "ইনভেন্টরি তালিকা",
      },
      {
        page: "/inventory/batches",
        icon: Tag,
        labelKey: "Batches",
        labelBn: "ব্যাচ",
      },
      {
        page: "/inventory/warehouse",
        icon: Building2,
        labelKey: "Warehouse",
        labelBn: "ওয়্যারহাউস",
      },
      {
        page: "/inventory/stock-adjustment",
        icon: SlidersHorizontal,
        labelKey: "Stock Adjustment",
        labelBn: "স্টক সংশোধন",
      },
      {
        page: "/inventory/stock-transfer",
        icon: ArrowRightLeft,
        labelKey: "Stock Transfer",
        labelBn: "স্টক ট্রান্সফার",
      },
      // {
      //   page: "/inventory/promotions",
      //   icon: Sparkles,
      //   labelKey: "Offers & Promotions",
      //   labelBn: "প্রমোশন ও অফার",
      // },
    ],
  },
  {
    labelKey: "Finance & Accounting",
    labelBn: "অর্থায়ন ও হিসাববিজ্ঞান",
    icon: Landmark,
    submenu: [
      {
        page: "/finance/overview",
        icon: LayoutDashboard,
        labelKey: "Overview",
        labelBn: "সারসংক্ষেপ",
      },
      {
        page: "/finance/transactions",
        icon: ArrowLeftRight,
        labelKey: "Transactions",
        labelBn: "লেনদেন",
      },
      {
        page: "/finance/income",
        icon: TrendingUp,
        labelKey: "Income",
        labelBn: "আয়",
      },
      {
        page: "/finance/expenses",
        icon: TrendingDown,
        labelKey: "Expenses",
        labelBn: "ব্যয়",
      },
      {
        page: "/finance/deposits-withdrawals",
        icon: ArrowUpRight,
        labelKey: "Deposit / Withdrawal",
        labelBn: "জমা / উত্তোলন",
      },
      {
        page: "/finance/receivables",
        icon: Receipt,
        labelKey: "Receivables",
        labelBn: "প্রাপ্য হিসাব",
      },
      {
        page: "/finance/payables",
        icon: CreditCard,
        labelKey: "Payables",
        labelBn: "প্রদেয় হিসাব",
      },
      {
        page: "/finance/loans",
        icon: Coins,
        labelKey: "Loan",
        labelBn: "ঋণ",
      },
      {
        page: "/finance/banks",
        icon: Wallet,
        labelKey: "Bank & Wallets",
        labelBn: "ব্যাংক ও ওয়ালেট",
      },
      {
        page: "/finance/settings",
        icon: Settings,
        labelKey: "Settings",
        labelBn: "সেটিংস",
      },
    ],
  },
  {
    page: "/reminders",
    icon: Bell,
    labelKey: "Reminders",
    labelBn: "রিমাইন্ডার",
  },
  {
    labelKey: "HRM",
    labelBn: "এইচআরএম",
    icon: UserCog,
    submenu: [
      {
        page: "/hrm/employees",
        icon: UserSquare2,
        labelKey: "Employees",
        labelBn: "কর্মীবৃন্দ",
      },
      {
        page: "/hrm/attendance",
        icon: CalendarCheck,
        labelKey: "Attendance",
        labelBn: "উপস্থিতি",
      },
      {
        page: "/hrm/leave",
        icon: CalendarOff,
        labelKey: "Leave",
        labelBn: "ছুটি",
      },
      {
        page: "/hrm/payroll",
        icon: Banknote,
        labelKey: "Payroll",
        labelBn: "বেতন",
      },
      {
        page: "/hrm/attendance-summary",
        icon: FileClock,
        labelKey: "Attendance Summary",
        labelBn: "উপস্থিতি সারসংক্ষেপ",
      },
      {
        page: "/hrm/roles-permissions",
        icon: Shield,
        labelKey: "Roles & Permissions",
        labelBn: "ভূমিকা ও অনুমতি",
      },
    ],
  },
  {
    labelKey: "Reports",
    labelBn: "রিপোর্ট",
    icon: BarChart3,
    submenu: [
      {
        page: "/reports/dashboard",
        icon: BarChart3,
        labelKey: "Dashboard",
        labelBn: "ড্যাশবোর্ড",
      },
      {
        page: "/reports/sales",
        icon: ShoppingCart,
        labelKey: "Sales Report",
        labelBn: "বিক্রয় রিপোর্ট",
      },
      {
        page: "/reports/purchase",
        icon: Truck,
        labelKey: "Purchase Reports",
        labelBn: "ক্রয় রিপোর্ট",
      },
      {
        page: "/reports/inventory",
        icon: Package,
        labelKey: "Inventory",
        labelBn: "ইনভেন্টরি",
      },
      {
        page: "/reports/finance",
        icon: BadgeDollarSign,
        labelKey: "Finance",
        labelBn: "ফাইনান্স",
      },
      {
        page: "/reports/customers",
        icon: Users,
        labelKey: "Customers",
        labelBn: "কাস্টমার",
      },
      {
        page: "/reports/suppliers",
        icon: Users,
        labelKey: "Suppliers",
        labelBn: "সরবরাহকারী",
      },
      {
        page: "/reports/branches",
        icon: Building2,
        labelKey: "Branches",
        labelBn: "শাখা",
      },
      {
        page: "/reports/employees",
        icon: UserCheck,
        labelKey: "Employees",
        labelBn: "কর্মচারী",
      },
      {
        page: "/reports/ai",
        icon: Sparkles,
        labelKey: "AI Insights",
        labelBn: "এআই ইনসাইটস",
      },
      {
        page: "/reports/saved",
        icon: FileSpreadsheet,
        labelKey: "Saved Reports",
        labelBn: "সংরক্ষিত রিপোর্ট",
      },
    ],
  },
];

export const bottomNavItems = [
  {
    page: "/ai",
    icon: Sparkles,
    labelKey: "AI",
    labelBn: "AI সহায়ক",
    isPro: true,
  },
  {
    page: "/settings/profile",
    icon: Settings,
    labelKey: "Settings",
    labelBn: "সেটিংস",
  },
];

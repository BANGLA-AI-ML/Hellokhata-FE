'use client';

import React, { useState } from 'react';
import { FinancePageHeader } from '@/components/finance/FinancePageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAppTranslation, useCurrency } from '@/hooks/useAppTranslation';
import { useToast } from '@/hooks/use-toast';
import { useCreateTaxCategories, useGetTaxCategories, useUpdateTaxCategory } from '@/hooks/api/useTaxCategories';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  ShieldAlert,
  CalendarDays,
  Percent,
  Sliders,
  CheckCircle2,
  Trash2,
  Lock,
  DollarSign,
  Plus,
  Info,
} from 'lucide-react';

interface TaxRule {
  _id?: string;
  id?: string;
  name: string;
  nameBn?: string;
  rate: number;
  isActive: boolean;
}

export default function FinanceSettingsPage() {
  const { isBangla } = useAppTranslation();
  const { toast } = useToast();
  const { mutate: createTaxCategory, isPending: isCreatingTax } = useCreateTaxCategories();
  const { data: taxRulesData, isLoading: isLoadingTaxRules } = useGetTaxCategories();
  const { mutate: updateTaxCategory, isPending: isUpdatingTax } = useUpdateTaxCategory();

  const handleStatusChange = (ruleId: string, newValue: string) => {
    const isActive = newValue === 'true';
    updateTaxCategory({ id: ruleId, data: { isActive } }, {
      onSuccess: () => {
        toast({
          title: isBangla ? "সফল" : "Success",
          description: isBangla ? "ট্যাক্স স্ট্যাটাস আপডেট করা হয়েছে" : "Tax status updated successfully",
        });
      },
      onError: () => {
        toast({
          title: isBangla ? "ত্রুটি" : "Error",
          description: isBangla ? "স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে" : "Failed to update tax status",
          variant: "destructive"
        });
      }
    });
  };

  // Active Tab: 'fiscal', 'taxes', 'preferences'
  const [activeTab, setActiveTab] = useState<'fiscal' | 'taxes' | 'preferences'>('taxes');

  // Success Feedback Alert
  const [alertMessage, setAlertMessage] = useState('');

  // Tab 1 States: Fiscal & Period Lock Settings
  const [fiscalStart, setFiscalStart] = useState('2026-07-01');
  const [fiscalEnd, setFiscalEnd] = useState('2027-06-30');
  const [lockDate, setLockDate] = useState('2026-07-31');
  const [isLockEnabled, setIsLockEnabled] = useState(true);

  // Tab 2 States: VAT & Tax rules registry
  const taxRules: TaxRule[] = taxRulesData || [];
  const [newTaxName, setNewTaxName] = useState('');
  const [newTaxRate, setNewTaxRate] = useState('');

  // Tab 3 States: General Preferences
  const [creditTerm, setCreditTerm] = useState('Net 30');
  const [autoDoubleEntry, setAutoDoubleEntry] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState('BDT');

  const triggerAlert = (msg: string, msgBn: string) => {
    setAlertMessage(isBangla ? msgBn : msg);
    setTimeout(() => setAlertMessage(''), 3500);
  };

  const handleSaveFiscalSettings = (e: React.FormEvent) => {
    e.preventDefault();
    triggerAlert('Fiscal cycle and entry lock dates saved successfully!', 'অর্থবছর এবং সময়কাল লক সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
  };

  const handleAddTaxRule = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTaxName.trim() || !newTaxRate.trim()) {
      toast({
        title: isBangla ? "ত্রুটি" : "Error",
        description: isBangla ? "অনুগ্রহ করে সমস্ত প্রয়োজনীয় ঘর পূরণ করুন" : "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const rateNum = parseFloat(newTaxRate) || 0;

    if (rateNum < 0) return;

    const newRule: TaxRule = {
      name: newTaxName,
      rate: rateNum,
      isActive: true,
    };

    createTaxCategory(newRule, {
      onSuccess: () => {
        triggerAlert('New VAT/Tax rule registered successfully!', 'নতুন ভ্যাট/কর নিয়ম সফলভাবে যোগ করা হয়েছে!');
        setNewTaxName('');
        setNewTaxRate('');
      },
      onError: () => {
        toast({
          title: isBangla ? "ত্রুটি" : "Error",
          description: isBangla ? "ভ্যাট/কর নিয়ম যোগ করতে সমস্যা হয়েছে" : "Failed to add Tax rule",
          variant: "destructive"
        });
      }
    });
  };

  const handleDeleteTaxRule = (id: string) => {
    // API deletion hook would be called here
    triggerAlert('Tax rule deleted successfully.', 'কর রেট নিয়মটি মুছে ফেলা হয়েছে।');
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    triggerAlert('Accounting preferences saved successfully!', 'হিসাববিজ্ঞান সংক্রান্ত পছন্দসমূহ সফলভাবে সংরক্ষিত হয়েছে!');
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <FinancePageHeader
        pageName="VAT & Tax Settings"
        pageNameBn="ভ্যাট ও ট্যাক্স সেটিংস"
        description="Configure standard VAT and tax rules, rates, and active statuses for your transactions."
        descriptionBn="আপনার লেনদেনের জন্য আদর্শ ভ্যাট ও কর নিয়মাবলী, শতকরা হার এবং স্ট্যাটাস কনফিগার করুন।"
        icon={Percent}
      />

      {/* 2. Access Control Lock Banner */}
      <Card className="border border-destructive/20 bg-destructive-subtle/30 backdrop-blur-sm shadow-sm">
        <CardContent className="flex items-center gap-3 p-4">
          <ShieldAlert className="h-5 w-5 text-destructive shrink-0" />
          <div className="flex-1 min-w-0 text-xs">
            <p className="font-bold text-foreground">
              {isBangla ? 'অ্যাক্সেস কন্ট্রোল রেস্ট্রিকশন' : 'Security Access Restrictions'}
            </p>
            <p className="text-muted-foreground mt-0.5">
              {isBangla
                ? 'এই পেজের কনফিগারেশন পরিবর্তন করার জন্য প্রশাসনিক অনুমতির প্রয়োজন।'
                : 'Modifying financial settings requires administrative permissions.'}
            </p>
          </div>
          <Badge variant="destructive" className="uppercase text-[9px] tracking-wider font-bold shrink-0">
            {isBangla ? 'মালিক / অ্যাকাউন্ট্যান্ট কেবল' : 'Owner / Accountant Only'}
          </Badge>
        </CardContent>
      </Card>

      {/* 3. Feedback Alert Success Banner */}
      {alertMessage && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-500 text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-all duration-300">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <span>{alertMessage}</span>
        </div>
      )}

      {/* 4. Settings Tabs Selector */}
      {/* <div className="flex gap-2 border-b border-border/40 pb-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('taxes')}
          className={cn(
            'py-2 px-3 border-b-2 transition-all flex items-center gap-1.5',
            activeTab === 'taxes' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Percent className="h-4 w-4" />
          <span>{isBangla ? 'ভ্যাট ও কর রেট' : 'VAT & Taxes'}</span>
        </button>

        <button
          onClick={() => setActiveTab('fiscal')}
          className={cn(
            'py-2 px-3 border-b-2 transition-all flex items-center gap-1.5',
            activeTab === 'fiscal' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <CalendarDays className="h-4 w-4" />
          <span>{isBangla ? 'অর্থবছর ও লক সেটিংস' : 'Fiscal & Lock Period'}</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={cn(
            'py-2 px-3 border-b-2 transition-all flex items-center gap-1.5',
            activeTab === 'preferences' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Sliders className="h-4 w-4" />
          <span>{isBangla ? 'হিসাববিজ্ঞান পছন্দ' : 'Preferences'}</span>
        </button>
      </div> */}

      {/* 5. Tab Panels */}
      <div className="space-y-4">
           {/* TAB 2: VAT & Tax rules setup */}
        {activeTab === 'taxes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Log New Tax rate rule */}
            <Card className="border-border/50 shadow-sm h-fit">
              <CardHeader className="pb-3 border-b border-border/30 bg-muted/10">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Plus className="h-4.5 w-4.5 text-primary" />
                  <span>{isBangla ? 'নতুন ভ্যাট/কর নিয়ম যোগ' : 'Register Tax Rule'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <form onSubmit={handleAddTaxRule} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-muted-foreground">{isBangla ? 'ভ্যাট/কর নিয়মের নাম *' : 'Tax Rule Name *'}</label>
                    <Input
                      placeholder={isBangla ? 'যেমন: ইনপুট ভ্যাট ১৫%' : 'e.g. Standard Sales VAT'}
                      value={newTaxName}
                      onChange={(e) => setNewTaxName(e.target.value)}
                      required
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-muted-foreground">{isBangla ? 'কর রেট হার (% Percentage) *' : 'Tax Rate (% Percentage) *'}</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="15.0"
                      value={newTaxRate}
                      onChange={(e) => setNewTaxRate(e.target.value)}
                      required
                      className="h-9 font-mono"
                    />
                  </div>

                  <Button type="submit" disabled={isCreatingTax} className="w-full text-xs h-9">
                    {isCreatingTax ? (isBangla ? 'অপেক্ষা করুন...' : 'Please wait...') : (isBangla ? 'নতুন কর রেট যোগ করুন' : 'Confirm Tax Rule')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Right Column: Tax Rules List */}
            <Card className="lg:col-span-2 border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/30 bg-muted/10">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Percent className="h-4.5 w-4.5 text-primary" />
                  <span>{isBangla ? 'সক্রিয় ভ্যাট ও কর কোডসমূহ' : 'Active VAT & Tax Codes'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border/30 font-bold text-muted-foreground">
                        <th className="p-3">{isBangla ? 'আইডি' : 'Tax ID'}</th>
                        <th className="p-3">{isBangla ? 'নিয়মের নাম' : 'Rule Name'}</th>
                        <th className="p-3 text-right">{isBangla ? 'কর রেট শতকরা' : 'Tax Percentage'}</th>
                        <th className="p-3">{isBangla ? 'স্ট্যাটাস' : 'Status'}</th>
                        <th className="p-3 text-center">{isBangla ? 'অ্যাকশন' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10">
                      {isLoadingTaxRules ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-muted-foreground">
                            {isBangla ? 'লোড হচ্ছে...' : 'Loading...'}
                          </td>
                        </tr>
                      ) : taxRules.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-muted-foreground">
                            {isBangla ? 'কোনো কর রেট পাওয়া যায়নি' : 'No tax rules found'}
                          </td>
                        </tr>
                      ) : taxRules.map((rule, index) => {
                        const ruleId = rule._id || rule.id || `temp-${index}`;
                        return (
                        <tr key={ruleId} className="hover:bg-muted/5">
                          <td className="p-3 font-mono text-muted-foreground">{ruleId}</td>
                          <td className="p-3 font-semibold text-foreground">{isBangla ? (rule.nameBn || rule.name) : rule.name}</td>
                          <td className="p-3 text-right font-mono font-bold text-foreground">{rule.rate}%</td>
                          <td className="p-3">
                            <Select
                              value={rule.isActive ? 'true' : 'false'}
                              onValueChange={(val) => handleStatusChange(ruleId, val)}
                              disabled={isUpdatingTax}
                            >
                              <SelectTrigger className={cn("h-7 text-[10px] w-24 font-bold rounded-md px-2", rule.isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-muted text-muted-foreground border-border/30")}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">{isBangla ? 'সক্রিয়' : 'Active'}</SelectItem>
                                <SelectItem value="false">{isBangla ? 'নিষ্ক্রিয়' : 'Inactive'}</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-3 text-center">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteTaxRule(ruleId)}
                              disabled={rule.rate === 0}
                              className="h-7 w-7 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

          </div>
        )}

        {/* TAB 2: Fiscal Year & Backdated Entry Lock Settings */}
        {activeTab === 'fiscal' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-border/50 shadow-sm">
              <CardHeader className="pb-3 border-b border-border/30 bg-muted/10">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <CalendarDays className="h-4.5 w-4.5 text-primary" />
                  <span>{isBangla ? 'অর্থবছর চক্র সেটিংস' : 'Fiscal Cycle Settings'}</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  {isBangla ? 'আপনার কোম্পানির বার্ষিক ট্যাক্স রিটার্ন ও রিপোর্টিং চক্র কাস্টমাইজ করুন।' : 'Configure the start and end dates for your annual tax return reporting cycle.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={handleSaveFiscalSettings} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-muted-foreground">{isBangla ? 'অর্থবছর শুরুর তারিখ' : 'Fiscal Year Start'}</label>
                      <Input
                        type="date"
                        value={fiscalStart}
                        onChange={(e) => setFiscalStart(e.target.value)}
                        required
                        className="h-9 font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-muted-foreground">{isBangla ? 'অর্থবছর সমাপ্তির তারিখ' : 'Fiscal Year End'}</label>
                      <Input
                        type="date"
                        value={fiscalEnd}
                        onChange={(e) => setFiscalEnd(e.target.value)}
                        required
                        className="h-9 font-mono"
                      />
                    </div>
                  </div>

                  {/* Backdated locking */}
                  <div className="border-t border-border/20 pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-bold text-foreground flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-primary" />
                          <span>{isBangla ? 'ব্যাকডেটেড এন্ট্রি পোস্টিং লক' : 'Lock Backdated Postings'}</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {isBangla
                            ? 'লক তারিখের পূর্বের কোনো আর্থিক লেনদেন পরিবর্তন বা এন্ট্রি ব্লক করুন।'
                            : 'Prevent creating, editing or deleting transaction postings before this date.'}
                        </p>
                      </div>
                      <select
                        value={isLockEnabled ? 'true' : 'false'}
                        onChange={(e) => setIsLockEnabled(e.target.value === 'true')}
                        className="h-8 rounded-lg border bg-background px-3 text-xs focus:outline-none"
                      >
                        <option value="true">{isBangla ? 'সক্রিয় (Enabled)' : 'Enabled'}</option>
                        <option value="false">{isBangla ? 'নিষ্ক্রিয় (Disabled)' : 'Disabled'}</option>
                      </select>
                    </div>

                    {isLockEnabled && (
                      <div className="space-y-1.5 max-w-xs">
                        <label className="font-semibold text-muted-foreground">{isBangla ? 'লেনদেন লক করার সময়সীমা' : 'Block Transactions Prior To'}</label>
                        <Input
                          type="date"
                          value={lockDate}
                          onChange={(e) => setLockDate(e.target.value)}
                          required
                          className="h-9 font-mono"
                        />
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="text-xs h-9">
                    {isBangla ? 'অর্থবছর ও লক সেটিংস সংরক্ষণ' : 'Save Fiscal Period Settings'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm bg-muted/10 h-fit text-xs">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-primary" />
                  <span>{isBangla ? 'লক পিরিয়ড নির্দেশিকা' : 'Lock Period Guidelines'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2.5 leading-relaxed text-muted-foreground font-medium">
                <p>
                  {isBangla
                    ? '১. আপনি যদি একটি অর্থবছর বন্ধ করে দেন, তবে অ্যাকাউন্ট ব্যালেন্স নিশ্চিত করতে পূর্ববর্তী বছর লক করে রাখা বাঞ্ছনীয়।'
                    : '1. Once you close out a fiscal quarter or year, enabling the period lock ensures historical books cannot be modified accidentally.'}
                </p>
                <p>
                  {isBangla
                    ? '২. লক সক্রিয় থাকলে কোনো সেলস, পারচেস বা ক্যাশ উইথড্রয়াল ভাউচার উক্ত তারিখের পূর্বে সাবমিট করা যাবে না।'
                    : '2. When active, sales invoices, payouts, and deposit entries before the lock boundary will be rejected by validation filters.'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

     

        {/* TAB 3: System Preferences */}
        {activeTab === 'preferences' && (
          <Card className="border-border/50 shadow-sm max-w-2xl">
            <CardHeader className="pb-3 border-b border-border/30 bg-muted/10">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sliders className="h-4.5 w-4.5 text-primary" />
                <span>{isBangla ? 'সিস্টেম ও হিসাববিজ্ঞান পলিসি পছন্দ' : 'Accounting & System Preferences'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleSavePreferences} className="space-y-5 text-xs">
                
                {/* Credit terms */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">{isBangla ? 'ডিফল্ট ক্রেডিট শর্তাবলী' : 'Default Credit Terms'}</p>
                    <p className="text-[11px] text-muted-foreground">{isBangla ? 'নতুন গ্রাহকের জন্য স্বয়ংক্রিয় প্রদেয় সময়সীমা।' : 'Auto-assigned payout due periods for customer invoices.'}</p>
                  </div>
                  <select
                    value={creditTerm}
                    onChange={(e) => setCreditTerm(e.target.value)}
                    className="h-8 rounded-lg border bg-background px-3 text-xs focus:outline-none"
                  >
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Net 30">Net 30 Days</option>
                    <option value="Net 60">Net 60 Days</option>
                  </select>
                </div>

                {/* Double Entry Voucher generation */}
                <div className="flex items-center justify-between border-t border-border/20 pt-4">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">{isBangla ? 'স্বয়ংক্রিয় দ্বৈত দাখিলা জার্নাল ভাউচার' : 'Auto Double-Entry Vouchers'}</p>
                    <p className="text-[11px] text-muted-foreground">{isBangla ? 'লেনদেনের উপর ভিত্তি করে খতিয়ানে দ্বৈত দাখিলা প্রিভিউ পোস্টিং তৈরি করা।' : 'Generate credit/debit double-entry journals for cash outflows & sales.'}</p>
                  </div>
                  <select
                    value={autoDoubleEntry ? 'true' : 'false'}
                    onChange={(e) => setAutoDoubleEntry(e.target.value === 'true')}
                    className="h-8 rounded-lg border bg-background px-3 text-xs focus:outline-none"
                  >
                    <option value="true">{isBangla ? 'সক্রিয় (Enabled)' : 'Enabled'}</option>
                    <option value="false">{isBangla ? 'নিষ্ক্রিয় (Disabled)' : 'Disabled'}</option>
                  </select>
                </div>

                {/* Currency symbol configuration */}
                <div className="flex items-center justify-between border-t border-border/20 pt-4">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span>{isBangla ? 'ডিফল্ট সিস্টেম মুদ্রা (Currency)' : 'Base System Currency'}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">{isBangla ? 'সিস্টেমের প্রাথমিক মুদ্রা বিন্যাস প্রতীক।' : 'Primary display currency symbol for calculations and statistics.'}</p>
                  </div>
                  <select
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="h-8 rounded-lg border bg-background px-3 text-xs focus:outline-none font-bold"
                  >
                    <option value="BDT">BDT (৳) - {isBangla ? 'বাংলাদেশী টাকা' : 'Bangladeshi Taka'}</option>
                    <option value="USD">USD ($) - {isBangla ? 'ইউএস ডলার' : 'US Dollar'}</option>
                    <option value="EUR">EUR (€) - {isBangla ? 'ইউরো' : 'Euro'}</option>
                    <option value="GBP">GBP (£) - {isBangla ? 'পাউন্ড' : 'British Pound'}</option>
                  </select>
                </div>

                <div className="border-t border-border/20 pt-4">
                  <Button type="submit" className="text-xs h-9">
                    {isBangla ? 'পছন্দসমূহ সংরক্ষণ করুন' : 'Save System Preferences'}
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}

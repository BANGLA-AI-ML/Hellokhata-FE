'use client';

import React, { useState, useMemo } from 'react';
import { useGetFeaturesPlans, useActivatePlan } from '@/hooks/api/useFeaturesPlan';
import { useSessionStore } from '@/stores/sessionStore';
import { useAppTranslation, useCurrency } from '@/hooks/useAppTranslation';
import {
  Check,
  X,
  Sparkles,
  Zap,
  ShieldCheck,
  Crown,
  ArrowRight,
  Cpu,
  CreditCard,
  Lock,
  BadgePercent,
  CheckCircle2,
  RefreshCw,
  Clock,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Types definition matching API contract
export interface FeatureItem {
  code: string;
  name: string;
  nameBn?: string;
  category?: string;
  isIncluded: boolean;
  value?: string | boolean;
  valueBn?: string;
  tooltip?: string;
}

export interface PlanItem {
  plan: 'trial' | 'starter' | 'growth' | 'intelligence';
  name: string;
  nameBn?: string;
  description: string;
  descriptionBn?: string;
  price: number;
  currency: string;
  billingCycle: string;
  badge?: string;
  badgeBn?: string;
  isCurrent?: boolean;
  features: FeatureItem[];
}


export default function PlansPage() {
  const { isBangla } = useAppTranslation();
  const { formatCurrency } = useCurrency();
  const currentStorePlan = useSessionStore((s) => s.plan);
  const setSessionPlan = useSessionStore((s) => s.setPlan);
  const currentBusiness = useSessionStore((s) => s.business);

  // Billing cycle state: monthly or annual (with 20% discount)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Modal checkout state
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PlanItem | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'bkash' | 'nagad' | 'card' | 'bank'>('bkash');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');

  // Query plans from API
  const { data: apiPlansData, isLoading: isPlansLoading } = useGetFeaturesPlans();
  const {mutate: activatePlan,isPending:isActivating} = useActivatePlan();

  // Directly use plans from apiPlansData
  const plans: PlanItem[] = apiPlansData || [];

  // Pricing calculation helper
  const getCalculatedPrice = (basePrice: number) => {
    if (basePrice === 0) return 0;
    if (billingCycle === 'annual') {
      return Math.round(basePrice * 0.8);
    }
    return basePrice;
  };

  const getAnnualTotal = (monthlyPrice: number) => {
    return getCalculatedPrice(monthlyPrice) * 12;
  };

  // Handle plan purchase / activation initiation
  const handleOpenCheckout = (plan: PlanItem) => {
    if (plan.isCurrent) {
      toast.info(isBangla ? 'এটি আপনার বর্তমান সক্রিয় প্ল্যান।' : 'This is your current active plan.');
      return;
    }
    setSelectedPlanForCheckout(plan);
    setPaymentPhone('');
    setTransactionId('');
  };

  // Execute Activation Mutation
  const handleConfirmActivation = () => {
    if (!selectedPlanForCheckout) return;

    if (selectedPlanForCheckout.price > 0 && !transactionId.trim()) {
      toast.error(isBangla ? 'অনুগ্রহ করে ট্রানজেকশন আইডি (TrxID) দিন' : 'Please provide the transaction ID (TrxID)');
      return;
    }


    const payload = {
      plan: selectedPlanForCheckout.plan,
      durationMonths:'1'
    };

   activatePlan(payload,{
    onSuccess: (data) =>{
      if(data.success){
        setSelectedPlanForCheckout(null);
        toast.success(isBangla ? 'অ্যাক্টিভেট সফল হয়েছে' : 'Plan activated successfully');
      }
    }
   })
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground pb-20 space-y-10">
      {/* ─── Hero Header ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden pt-6 pb-10 rounded-3xl bg-gradient-to-b from-primary/10 via-background to-background border border-border/40 px-4 sm:px-8 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold mb-4 backdrop-blur-md shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span>{isBangla ? 'প্রিমিয়াম সাবস্ক্রিপশন ও স্কেলিং প্যাকেজ' : 'ELITE BUSINESS SUBSCRIPTION & EXPANSION'}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
          {isBangla
            ? 'আপনার ব্যবসার অগ্রগতির জন্য সেরা প্ল্যান বেছে নিন'
            : 'Supercharge Your Business with Enterprise Intelligence'}
        </h1>

        {/* Current Active Plan Status Banner */}
        <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-3 px-4 py-2 rounded-2xl bg-card/80 border border-border backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-medium text-muted-foreground">
              {isBangla ? 'বর্তমান সক্রিয় প্যাকেজ:' : 'Your Current Active Tier:'}
            </span>
            <span className="text-sm font-bold text-foreground capitalize flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-500" />
              {currentStorePlan}
            </span>
          </div>
          <span className="text-border hidden sm:inline">|</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-primary" />
            {isBangla ? 'স্বয়ংক্রিয় ক্লাউড ব্যাকআপ সক্রিয়' : 'Cloud Sync & 99.9% Uptime Active'}
          </span>
        </div>

        {/* ─── Monthly / Annual Switcher ──────────────────────────────────── */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="bg-muted/80 p-1 rounded-2xl border border-border/80 inline-flex items-center relative shadow-inner">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                'px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer',
                billingCycle === 'monthly'
                  ? 'bg-background text-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isBangla ? 'মাসিক বিলিং' : 'Monthly Billing'}
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={cn(
                'px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2',
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span>{isBangla ? 'বার্ষিক বিলিং' : 'Annual Billing'}</span>
              <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-amber-400/30">
                {isBangla ? '২০% ছাড়' : '20% OFF'}
              </span>
            </button>
          </div>
        
        </div>
      </div>

      {/* ─── Pricing Cards Grid with Full Features ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full items-stretch">
        {isPlansLoading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">
              {isBangla ? 'প্ল্যান লোড হচ্ছে...' : 'Loading subscription plans...'}
            </p>
          </div>
        ) : plans.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {isBangla ? 'কোনো প্ল্যান পাওয়া যায়নি।' : 'No plans available from the server.'}
            </p>
          </div>
        ) : (
          plans.map((item) => {
          const isGrowth = item.plan === 'growth';
          const isIntelligence = item.plan === 'intelligence';
          const isStarter = item.plan === 'starter';
          const isTrial = item.plan === 'trial';
          const isCurrent = item.isCurrent;

          const calculatedPrice = getCalculatedPrice(item.price);
          const annualTotal = getAnnualTotal(item.price);

          const planTitle = isBangla && item.nameBn ? item.nameBn : item.name;
          const planDesc = isBangla && item.descriptionBn ? item.descriptionBn : item.description;
          const planBadge = isBangla && item.badgeBn ? item.badgeBn : item.badge;

          return (
            <div
              key={item.plan}
              className={cn(
                'relative flex flex-col rounded-3xl p-5 sm:p-6 transition-all duration-300 backdrop-blur-xl',
                'bg-card/70 border hover:shadow-2xl',
                isGrowth
                  ? 'border-primary shadow-xl shadow-primary/10 ring-2 ring-primary/40 bg-gradient-to-b from-primary/15 via-card/90 to-card'
                  : isIntelligence
                  ? 'border-amber-500/50 shadow-lg shadow-amber-500/5 hover:border-amber-400 bg-gradient-to-b from-amber-500/10 via-card/90 to-card'
                  : 'border-border/80 hover:border-primary/40',
                isCurrent && 'ring-2 ring-emerald-500/60 border-emerald-500/40'
              )}
            >
              {/* Top Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0',
                      isGrowth
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : isIntelligence
                        ? 'bg-amber-500 text-amber-950 shadow-md'
                        : isStarter
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isGrowth ? (
                      <Flame className="w-5 h-5 text-white animate-pulse" />
                    ) : isIntelligence ? (
                      <Cpu className="w-5 h-5" />
                    ) : isStarter ? (
                      <Zap className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight truncate">
                    {planTitle}
                  </h3>
                </div>

                {/* Badge tags */}
                {isCurrent ? (
                  <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] sm:text-[11px] px-2 py-0.5 font-bold shrink-0">
                    {isBangla ? 'বর্তমান' : 'Active'}
                  </Badge>
                ) : planBadge ? (
                  <Badge
                    className={cn(
                      'text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 shadow-sm shrink-0',
                      isGrowth
                        ? 'bg-primary text-primary-foreground border-none'
                        : isIntelligence
                        ? 'bg-amber-400 text-amber-950 font-extrabold border-none'
                        : 'bg-muted text-foreground'
                    )}
                  >
                    {planBadge}
                  </Badge>
                ) : null}
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground line-clamp-2 min-h-[34px] mb-4">
                {planDesc}
              </p>

              {/* Price Display */}
              <div className="mb-5 pt-2 border-t border-border/50">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
                    {item.price === 0 ? (
                      isBangla ? 'ফ্রি' : '৳0'
                    ) : (
                      formatCurrency(calculatedPrice)
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {item.price === 0
                      ? isBangla ? '/ ৩০ দিন' : '/ 30 days'
                      : isBangla ? '/ প্রতি মাস' : '/ month'}
                  </span>
                </div>

                {/* Annual billing detail note */}
                {billingCycle === 'annual' && item.price > 0 && (
                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground line-through">
                      {formatCurrency(item.price)}/mo
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      {formatCurrency(annualTotal)} {isBangla ? 'বার্ষিক' : '/year'}
                    </span>
                  </div>
                )}
              </div>

              {/* CTA Action Button */}
              <Button
                onClick={() => handleOpenCheckout(item)}
                disabled={isCurrent || isActivating}
                className={cn(
                  'w-full py-4 sm:py-5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 cursor-pointer mb-5',
                  isCurrent
                    ? 'bg-muted/60 text-muted-foreground border border-border cursor-default hover:bg-muted/60'
                    : isGrowth
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40'
                    : isIntelligence
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 hover:brightness-105 font-extrabold shadow-lg shadow-amber-500/20'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
                )}
              >
                {isCurrent ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {isBangla ? 'বর্তমান সক্রিয় প্ল্যান' : 'Current Active Plan'}
                  </span>
                ) : isTrial ? (
                  <span className="flex items-center justify-center gap-1.5">
                    {isBangla ? 'ট্রায়াল শুরু করুন' : 'Start 30-Day Trial'}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    {isBangla ? `${planTitle}-এ আপগ্রেড` : `Upgrade to ${item.name}`}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>

              {/* Full Plan Features Checklist */}
              <div className="space-y-3 flex-1 border-t border-border/60 pt-5 mt-auto">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    {isBangla ? 'প্যাকেজের ফিচারসমূহ:' : 'Plan Features:'}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold px-2 py-0.5 rounded-full bg-muted/60 border border-border/40">
                    {item.features?.filter((f) => f.isIncluded).length || 0} {isBangla ? 'টি অন্তর্ভুক্ত' : 'included'}
                  </span>
                </div>

                <div className="space-y-3">
                  {item.features && item.features.length > 0 ? (
                    item.features.map((feat, idx) => {
                      const isInc = Boolean(feat.isIncluded);
                      const featName = (isBangla && feat.nameBn ? feat.nameBn : feat.name) || feat.code || '';
                      const featVal = isBangla && feat.valueBn ? feat.valueBn : feat.value;

                      return (
                        <div
                          key={`${feat.code || idx}-${idx}`}
                          className={cn(
                            'flex items-start gap-2.5 text-xs py-0.5 transition-colors',
                            !isInc && 'opacity-40'
                          )}
                        >
                          {isInc ? (
                            <div
                              className={cn(
                                'w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-xs',
                                isGrowth
                                  ? 'bg-primary/20 text-primary'
                                  : isIntelligence
                                  ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400'
                                  : 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400'
                              )}
                            >
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                              <X className="w-2.5 h-2.5" />
                            </div>
                          )}

                          <div className="flex-1 leading-snug min-w-0">
                            <span
                              className={cn(
                                'font-medium text-xs break-words',
                                isInc ? 'text-foreground' : 'text-muted-foreground line-through'
                              )}
                            >
                              {featName}
                            </span>
                            {featVal && featVal !== 'true' && featVal !== 'false' && (
                              <span
                                className={cn(
                                  'block text-[11px] font-semibold mt-0.5',
                                  isInc
                                    ? isGrowth
                                      ? 'text-primary'
                                      : isIntelligence
                                      ? 'text-amber-500 dark:text-amber-400'
                                      : 'text-muted-foreground'
                                    : 'text-muted-foreground/60 line-through'
                                )}
                              >
                                {featVal}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : null}
                </div>
              </div>
            </div>
          );
        })
      )}
      </div>

      {/* Checkout & Plan Activation Modal */}
      <Dialog
        open={!!selectedPlanForCheckout}
        onOpenChange={(open) => !open && setSelectedPlanForCheckout(null)}
      >
        <DialogContent className="sm:max-w-[600px] w-full max-h-[90vh] overflow-y-auto bg-card border-border p-5 sm:p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {isBangla ? 'সাবস্ক্রিপশন নিশ্চিতকরণ ও পেমেন্ট' : 'Confirm Subscription & Activation'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isBangla
                ? 'আপনার নির্বাচিত প্ল্যান ও পেমেন্ট বিবরণ যাচাই করে সক্রিয় করুন।'
                : 'Review your selected plan tier, period, and complete instant activation.'}
            </DialogDescription>
          </DialogHeader>

          {selectedPlanForCheckout && (
            <div className="space-y-4 py-2">
              {/* Plan Summary Box */}
              <div className="p-4 rounded-2xl bg-muted/60 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-foreground text-base">
                      {isBangla && selectedPlanForCheckout.nameBn
                        ? selectedPlanForCheckout.nameBn
                        : selectedPlanForCheckout.name}
                    </h4>
                    <span className="text-xs text-muted-foreground capitalize">
                      {billingCycle === 'annual'
                        ? isBangla
                          ? 'বার্ষিক বিলিং (২০% ছাড়)'
                          : 'Annual Billing (20% Off)'
                        : isBangla
                        ? 'মাসিক বিলিং'
                        : 'Monthly Billing'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-extrabold text-primary block">
                      {selectedPlanForCheckout.price === 0
                        ? isBangla
                          ? 'ফ্রি'
                          : '৳0'
                        : billingCycle === 'annual'
                        ? formatCurrency(getAnnualTotal(selectedPlanForCheckout.price))
                        : formatCurrency(selectedPlanForCheckout.price)}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {selectedPlanForCheckout.price === 0
                        ? isBangla
                          ? '৩০ দিনের জন্য'
                          : 'For 30 days'
                        : billingCycle === 'annual'
                        ? isBangla
                          ? '১২ মাসের মোট মূল্য'
                          : 'Billed for 12 months'
                        : isBangla
                        ? 'প্রতি মাস'
                        : 'Per month'}
                    </span>
                  </div>
                </div>

                {/* Feature highlights badge */}
                <div className="pt-2 border-t border-border/40 flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-[10px] bg-background">
                    {selectedPlanForCheckout.plan === 'intelligence'
                      ? isBangla
                        ? 'এআই পূর্বাভাস + আনলিমিটেড শাখা'
                        : 'AI Forecasting + Unlimited Outlets'
                      : selectedPlanForCheckout.plan === 'growth'
                      ? isBangla
                        ? 'ব্যাচ/মেয়াদ + ৫টি শাখা'
                        : 'Batch & Expiry + 5 Branches'
                      : selectedPlanForCheckout.plan === 'starter'
                      ? isBangla
                        ? 'দ্রুত পিওএস + স্টক কন্ট্রোল'
                        : 'Fast POS + Stock Control'
                      : isBangla
                      ? '৩০ দিন ফ্রি ট্রায়াল'
                      : '30-Day Free Trial'}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] bg-background text-emerald-500 border-emerald-500/30">
                    {isBangla ? 'তাৎক্ষণিক ক্লাউড অ্যাক্টিভেশন' : 'Instant Cloud Activation'}
                  </Badge>
                </div>
              </div>

              {/* Payment Methods (if price > 0) */}
              {selectedPlanForCheckout.price > 0 && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-2">
                      {isBangla ? 'পেমেন্ট মেথড বেছে নিন:' : 'Select Payment Gateway:'}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'bkash', label: 'bKash', color: 'border-pink-500/50 bg-pink-500/10 text-pink-400' },
                        { id: 'nagad', label: 'Nagad', color: 'border-orange-500/50 bg-orange-500/10 text-orange-400' },
                        { id: 'card', label: 'Card', color: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' },
                        { id: 'bank', label: 'Bank', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' },
                      ].map((pm) => (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setSelectedPaymentMethod(pm.id as any)}
                          className={cn(
                            'py-2 px-1 sm:px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center',
                            selectedPaymentMethod === pm.id
                              ? cn(pm.color, 'ring-2 ring-primary/40 shadow-sm')
                              : 'border-border bg-card hover:bg-muted text-muted-foreground'
                          )}
                        >
                          {pm.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment instructions */}
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground space-y-1">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-primary" />
                      {selectedPaymentMethod === 'bkash'
                        ? isBangla ? 'বিকাশ মার্চেন্ট / সেন্ড মানি নম্বর: 01700-000000' : 'bKash Merchant / Agent: 01700-000000'
                        : selectedPaymentMethod === 'nagad'
                        ? isBangla ? 'নগদ মার্চেন্ট নম্বর: 01800-000000' : 'Nagad Merchant: 01800-000000'
                        : isBangla ? 'কার্ড ও অনলাইন গেটওয়ে তাৎক্ষণিক সক্রিয় হবে' : 'Card & Online Banking (Instant Checkout)'}
                    </p>
                    <p className="text-[11px]">
                      {isBangla
                        ? 'পেমেন্ট সম্পন্ন করে নিচের বক্সে আপনার ব্যবহৃত মোবাইল নম্বর ও TrxID প্রদান করুন।'
                        : 'Send payment and input your sender account and Transaction ID (TrxID) below for instant automated confirmation.'}
                    </p>
                  </div>

                  {/* Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        {isBangla ? 'মোবাইল নম্বর' : 'Sender Phone / Account'}
                      </label>
                      <Input
                        placeholder="01XXXXXXXXX"
                        value={paymentPhone}
                        onChange={(e) => setPaymentPhone(e.target.value)}
                        className="bg-card border-border rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        {isBangla ? 'ট্রানজেকশন আইডি (TrxID) *' : 'Transaction ID (TrxID) *'}
                      </label>
                      <Input
                        placeholder="e.g. 9J8A7K2L"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="bg-card border-border rounded-xl text-xs font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Security reassurance */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-1">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-Bit SSL Encrypted & Instant Automated Activation</span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button
              variant="outline"
              onClick={() => setSelectedPlanForCheckout(null)}
              disabled={isActivating}
              className="rounded-xl cursor-pointer"
            >
              {isBangla ? 'বাতিল' : 'Cancel'}
            </Button>

            <Button
              onClick={handleConfirmActivation}
              disabled={isActivating}
              className="rounded-xl bg-primary text-primary-foreground font-bold shadow-md cursor-pointer hover:bg-primary/90"
            >
              {isActivating ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {isBangla ? 'সক্রিয় হচ্ছে...' : 'Activating Plan...'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  {isBangla ? 'নিশ্চিত ও সক্রিয় করুন' : 'Confirm & Activate'}
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
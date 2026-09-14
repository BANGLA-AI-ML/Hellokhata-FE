// Hello Khata OS - Parties Page
// হ্যালো খাতা - পার্টি পেজ

'use client';
import { useState } from 'react';
import { PageHeader, EmptyState } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Plus,
  Search,
  User,
  Building2,
  Loader2,
  SlidersHorizontal,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useCurrency, useAppTranslation } from '@/hooks/useAppTranslation';
import { cn } from '@/lib/utils';
import type { Party } from '@/types';
import { useRouter } from 'next/navigation';
import { useParties, useDeleteParty, usePartyStats } from '@/hooks/api/useParties';
import { getInitials } from '@/components/parties/utils';
import { PartyDetailsAndTransactions } from '@/components/parties/PartyDetailsAndTransactions';
import { toast } from 'sonner';

export default function PartiesPage() {
  const { t, isBangla } = useAppTranslation();
  const { formatCurrency } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'customer' | 'supplier' | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'receivable' | 'payable' | 'settled'>('all');
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const deletePartyMutation = useDeleteParty();

  const handleEditParty = (party: Party) => {
    router.push(`/parties/edit/${party.id}`);
  };

  const handleDeleteParty = (partyId: string, partyName: string) => {
    if (confirm(isBangla ? `আপনি কি নিশ্চিত "${partyName}" ডিলিট করতে চান?` : `Are you sure you want to delete "${partyName}"?`)) {
      deletePartyMutation.mutate(partyId, {
        onSuccess: () => {
          toast.success(isBangla ? 'পার্টি মুছে ফেলা হয়েছে' : 'Party deleted successfully');
          if (selectedParty?.id === partyId) {
            setSelectedParty(null);
          }
        },
      });
    }
  };

  const { data: parties=[], isLoading } = useParties( { type: typeFilter,search:searchTerm, });
  const {data: partyStats} = usePartyStats();
  console.log("partyStats",partyStats)
  const router = useRouter();


  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title={t('parties.title')}
          subtitle={isBangla ? 'গ্রাহক ও সরবরাহকারী ব্যবস্থাপনা' : 'Customer & supplier management'}
          icon={Users}
          action={{
            label: t('parties.addParty'),
            onClick: () => router.push('/parties/new'),
            icon: Plus,
          }} 
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setTypeFilter('customer')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{partyStats?.customers || 0}</div>
                  <p className="text-sm text-gray-500 truncate">{t('parties.customers')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setTypeFilter('supplier')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{partyStats?.suppliers || 0}</div>
                  <p className="text-sm text-gray-500 truncate">{t('parties.suppliers')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl font-bold text-emerald-600 truncate">{formatCurrency(partyStats?.totalReceivable || 0)}</div>
                  <p className="text-sm text-gray-500 truncate">{t('dashboard.receivable')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-red-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl font-bold text-red-600 truncate">{formatCurrency(partyStats?.totalPayable || 0)}</div>
                  <p className="text-sm text-gray-500 truncate">{t('dashboard.payable')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Split Layout Container */}
        <div className="flex flex-col lg:flex-row min-h-[600px] items-stretch overflow-hidden">
          {/* Left Column: Parties List */}
          <div
            className={cn(
              "transition-all duration-300 ease-in-out flex flex-col shrink-0 overflow-hidden",
              selectedParty
                ? "w-0 h-0 min-h-0 opacity-0 pointer-events-none lg:w-[35%] lg:h-auto lg:min-h-0 lg:opacity-100 lg:pointer-events-auto lg:mr-6"
                : "w-full opacity-100"
            )}
          >
            <Card className="p-6 flex flex-col h-full w-full flex-1">
              {/* added total count */}
              <div className="flex items-center justify-between mb-4 gap-4">
                <h2 className="text-lg font-bold text-foreground">
                  {isBangla ? `পার্টি (${partyStats?.total || 0})` : `Parties (${partyStats?.total || 0})`}
                </h2>
                <Button
                  onClick={() => router.push('/parties/new')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-4 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {isBangla ? 'পার্টি যোগ করুন' : 'Add Party'}
                </Button>
              </div>

              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground shrink-0" />
                  <Input
                    placeholder={isBangla ? 'পার্টি খুঁজুন...' : 'Search parties...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 text-xs bg-background border-input"
                  />
                </div>
                <Button variant="outline" size="icon" className="h-9 w-9 border-input hover:bg-accent hover:text-accent-foreground text-foreground shrink-0 cursor-pointer">
                  <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTypeFilter(typeFilter === 'customer' ? 'all' : 'customer')}
                  className={cn(
                    "rounded-full px-4 h-8 text-xs font-medium border-input cursor-pointer",
                    typeFilter === 'customer'
                      ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30"
                      : "text-muted-foreground bg-transparent hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {isBangla ? 'গ্রাহক' : 'Customer'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTypeFilter(typeFilter === 'supplier' ? 'all' : 'supplier')}
                  className={cn(
                    "rounded-full px-4 h-8 text-xs font-medium border-input cursor-pointer",
                    typeFilter === 'supplier'
                      ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30"
                      : "text-muted-foreground bg-transparent hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {isBangla ? 'সরবরাহকারী' : 'Supplier'}
                </Button>

                <Select
                  value={paymentFilter}
                  onValueChange={(value: any) => setPaymentFilter(value)}
                >
                  <SelectTrigger className="w-auto h-8 rounded-full px-4 text-xs font-medium border-input bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:ring-0 cursor-pointer">
                    <SelectValue placeholder={isBangla ? 'সব পেমেন্ট' : 'All Payment'} />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="all">{isBangla ? 'সব পেমেন্ট' : 'All Payment'}</SelectItem>
                    <SelectItem value="receivable">{isBangla ? 'পাওনা' : 'Receivable'}</SelectItem>
                    <SelectItem value="payable">{isBangla ? 'দেনা' : 'Payable'}</SelectItem>
                    <SelectItem value="settled">{isBangla ? 'মিমাংসিত' : 'Settled'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center flex-1 py-12">
                  <Loader2 className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : parties?.length === 0 ? (
                <div className="flex-1 py-12">
                  <EmptyState
                    icon={Users}
                    title={isBangla ? 'কোনো পার্টি নেই' : 'No parties found'}
                    description={isBangla ? 'নতুন পার্টি যোগ করুন' : 'Add your first party'}
                    action={{
                      label: t('parties.addParty'),
                      onClick: () => router.push('/parties/new'),
                      icon: Plus,
                    }}
                  />
                </div>
              ) : (
                <div className="flex-1 overflow-x-auto border border-border/60 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-muted/30 text-muted-foreground border-b border-border/80 font-semibold">
                        <th className="px-3.5 py-3 whitespace-nowrap">{isBangla ? 'পার্টি' : 'Party'}</th>
                        <th className="px-3.5 py-3 whitespace-nowrap">{isBangla ? 'ফোন' : 'Phone'}</th>
                        <th className="px-3.5 py-3 whitespace-nowrap">{isBangla ? 'ইমেইল' : 'Email'}</th>
                        <th className="px-3.5 py-3 whitespace-nowrap">{isBangla ? 'ঠিকানা' : 'Address'}</th>
                        <th className="px-3.5 py-3 text-right whitespace-nowrap">{isBangla ? 'মোট পরিশোধ' : 'Total Paid'}</th>
                        <th className="px-3.5 py-3 text-right whitespace-nowrap">{isBangla ? 'মোট বাকি' : 'Total Due'}</th>
                        <th className="px-3.5 py-3 text-right whitespace-nowrap">{isBangla ? 'অ্যাকশন' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {parties?.map((party: any) => {
                        const typeConfig = {
                          customer: {
                            label: isBangla ? 'গ্রাহক' : 'Customer',
                            color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                          },
                          supplier: {
                            label: isBangla ? 'সরবরাহকারী' : 'Supplier',
                            color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                          },
                        };
                        const currentType = typeConfig[party.type as keyof typeof typeConfig];
                        const totalPaid = party.totalPaid ?? party.totalPayments ?? 0;
                        const totalDue = party.totalDue ?? party.dueAmount ?? party.currentBalance ?? 0;

                        return (
                          <tr
                            key={party.id}
                            onClick={() => setSelectedParty(party)}
                            className={cn(
                              "hover:bg-muted/30 transition-colors cursor-pointer",
                              selectedParty?.id === party.id ? "bg-primary/10 border-l-2 border-primary" : ""
                            )}
                          >
                            {/* Party */}
                            <td className="px-3.5 py-3 align-middle">
                              <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                                  {getInitials(party?.name)}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-foreground truncate leading-tight text-xs">
                                    {party?.name}
                                  </p>
                                  <span className={cn("inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-medium border shrink-0 mt-0.5", currentType?.color)}>
                                    {currentType?.label}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Phone */}
                            <td className="px-3.5 py-3 align-middle text-muted-foreground font-mono text-xs whitespace-nowrap">
                              {party?.phone || '—'}
                            </td>

                            {/* Email */}
                            <td className="px-3.5 py-3 align-middle text-muted-foreground text-xs truncate max-w-[160px]" title={party?.email}>
                              {party?.email || '—'}
                            </td>

                            {/* Address */}
                            <td className="px-3.5 py-3 align-middle text-muted-foreground text-xs truncate max-w-[180px]" title={party.address}>
                              {party.address || '—'}
                            </td>

                            {/* Total Paid */}
                            <td className="px-3.5 py-3 align-middle text-right font-medium text-foreground text-xs font-mono whitespace-nowrap">
                              {formatCurrency(totalPaid)}
                            </td>

                            {/* Total Due */}
                            <td className="px-3.5 py-3 align-middle text-right font-bold text-xs font-mono whitespace-nowrap">
                              <span
                                className={cn(
                                  totalDue > 0
                                    ? "text-rose-500"
                                    : totalDue < 0
                                    ? "text-emerald-500"
                                    : "text-muted-foreground"
                                )}
                              >
                                {formatCurrency(Math.abs(totalDue))}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-3.5 py-3 align-middle text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-pointer"
                                  onClick={() => setSelectedParty(party)}
                                  title={isBangla ? "বিস্তারিত দেখুন" : "View Details"}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md cursor-pointer"
                                  onClick={() => handleEditParty(party)}
                                  title={isBangla ? "এডিট করুন" : "Edit Party"}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                {/* <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-md cursor-pointer"
                                  onClick={() => handleDeleteParty(party.id, party.name)}
                                  title={isBangla ? "মুছে ফেলুন" : "Delete Party"}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button> */}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: Transaction History and Details */}
          <div
            className={cn(
              "transition-all duration-300 ease-in-out flex flex-col overflow-hidden",
              selectedParty
                ? "w-full opacity-100 flex-1 min-h-[500px]"
                : "w-0 h-0 min-h-0 opacity-0 pointer-events-none"
            )}
          >
            {selectedParty && (
              <Card className="p-6 flex flex-col h-full flex-1">
                <PartyDetailsAndTransactions
                  partyId={selectedParty.id}
                  onClose={() => setSelectedParty(null)}
                />
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

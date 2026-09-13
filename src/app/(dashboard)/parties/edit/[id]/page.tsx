'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/common';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Check,
  X,
  User,
  Building2,
  Camera,
  Upload,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  CreditCard,
  FileText,
  Sparkles,
  Trash2,
  Loader2,
  Users,
  ArrowLeft,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useUser } from '@/stores';
import { useParty, useUpdateParty, useDeleteParty } from '@/hooks/api/useParties';
import { PartyFormPayload } from '@/app/(dashboard)/parties/new/page';

interface EditPartyPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPartyPage({ params }: EditPartyPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { isBangla } = useAppTranslation();
  const user = useUser();

  const { data: partyResponse, isLoading } = useParty(id);
  const party = partyResponse?.data || partyResponse;
  const updateMutation = useUpdateParty(id);
  const deleteMutation = useDeleteParty();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    type: 'customer' as 'customer' | 'supplier' | 'both',
    openingBalance: '0',
    balanceType: 'receive' as 'receive' | 'give',
    creditLimit: '',
    notes: '',
    avatarUrl: '',
  });

  // Pre-fill form when party data loads
  useEffect(() => {
    if (party) {
      setFormData({
        name: party.name || '',
        phone: party.phone || '',
        email: party.email || '',
        address: party.address || '',
        type: (party.type as any) || 'customer',
        openingBalance: party.openingBalance != null ? Math.abs(party.openingBalance).toString() : '0',
        balanceType: (party.openingBalance || 0) < 0 || party.balanceDirection === 'give' ? 'give' : 'receive',
        creditLimit: party.creditLimit != null ? party.creditLimit.toString() : '',
        notes: party.notes || '',
        avatarUrl: party.avatarUrl || party.photo || '',
      });
    }
  }, [party]);

  const updateForm = (key: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const isPending = updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error(isBangla ? 'নাম প্রয়োজন' : 'Name is required');
      return;
    }

    const partyItem: PartyFormPayload = {
      name: formData.name,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      address: formData.address || undefined,
      type: formData.type,
      branchId: user?.branchId || '',
      openingBalance: (parseFloat(formData.openingBalance) || 0) * (formData.balanceType === 'give' ? -1 : 1),
      balanceDirection: formData.balanceType,
      creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : undefined,
      notes: formData.notes || undefined,
      avatarUrl: formData.avatarUrl || undefined,
    };

    updateMutation.mutate({ id, data: partyItem }, {
      onSuccess: () => {
        toast.success(isBangla ? 'পার্টি তথ্য আপডেট হয়েছে!' : 'Party updated successfully!');
        router.push('/parties');
      },
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(isBangla ? 'পার্টি মুছে ফেলা হয়েছে!' : 'Party deleted successfully!');
        router.push('/parties');
      },
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-xs text-muted-foreground">{isBangla ? 'তথ্য লোড হচ্ছে...' : 'Loading party details...'}</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!party) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
          <Users className="h-8 w-8 opacity-60" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">{isBangla ? 'পার্টি পাওয়া যায়নি' : 'Party Not Found'}</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {isBangla ? 'অনুরোধকৃত পার্টির তথ্য খুঁজে পাওয়া যায়নি অথবা মুছে ফেলা হয়েছে।' : 'The requested party does not exist or has been removed.'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push('/parties')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {isBangla ? 'পার্টি তালিকায় ফিরুন' : 'Back to Parties'}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Navigation & Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {isBangla ? 'পার্টি তথ্য সম্পাদনা' : 'Edit Party'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Edit Mode
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isBangla
                ? 'পার্টির বিদ্যমান যোগাযোগের তথ্য ও ব্যালেন্স সংশোধন করুন'
                : 'Modify party profile, opening balance, and contact credentials'}
            </p>
          </div>
        </div>

        {/* Action buttons at top header */}
        <div className="flex items-center gap-3">
          {/* Delete Button */}
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="h-10 px-4 text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                {isBangla ? 'মুছুন' : 'Delete'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[380px]">
              <AlertDialogHeader>
                <AlertDialogTitle>{isBangla ? 'পার্টি মুছবেন?' : 'Delete Party?'}</AlertDialogTitle>
                <AlertDialogDescription>
                  {isBangla
                    ? 'এই কাজ পূর্বাবস্থায় ফেরানো যাবে না। পার্টিটি স্থায়ীভাবে মুছে ফেলা হবে।'
                    : 'This action cannot be undone. This party profile will be permanently deleted.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{isBangla ? 'বাতিল' : 'Cancel'}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  {isBangla ? 'মুছুন' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            variant="outline"
            onClick={() => router.back()}
            className="h-10 px-5 text-xs font-semibold cursor-pointer"
          >
            <X className="h-3.5 w-3.5 mr-1.5" />
            {isBangla ? 'বাতিল' : 'Cancel'}
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-md cursor-pointer"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                {isBangla ? 'আপডেট হচ্ছে...' : 'Updating...'}
              </span>
            ) : (
              <>
                <Check className="h-4 w-4 mr-1.5" />
                {isBangla ? 'আপডেট করুন' : 'Update Party'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Full-Width Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Photo Upload & Party Type & Financial Config */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Photo & Type Card */}
          <Card className="border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/40 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                {isBangla ? 'প্রোফাইল ছবি ও ধরন' : 'Profile Photo & Type'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Photo Upload Box */}
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/80 rounded-2xl bg-muted/20 space-y-4 hover:border-primary/50 transition-colors">
                <div className="relative group">
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt="Party Avatar"
                      className="h-28 w-28 rounded-2xl object-cover border-2 border-primary shadow-lg"
                    />
                  ) : (
                    <div className="h-28 w-28 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20 text-primary shadow-inner">
                      <Camera className="h-10 w-10 opacity-70" />
                    </div>
                  )}

                  {formData.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => updateForm('avatarUrl', '')}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1.5 rounded-full shadow-md hover:bg-destructive/90 transition-transform hover:scale-105 cursor-pointer"
                      title={isBangla ? "ছবি সরান" : "Remove Photo"}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            updateForm('avatarUrl', reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow hover:bg-primary/90 transition-all cursor-pointer">
                      <Upload className="h-3.5 w-3.5" />
                      <span>
                        {formData.avatarUrl
                          ? isBangla
                            ? "ছবি পরিবর্তন"
                            : "Change Photo"
                          : isBangla
                          ? "ছবি আপলোড"
                          : "Upload Photo"}
                      </span>
                    </div>
                  </label>
                </div>
                <p className="text-[11px] text-muted-foreground text-center">
                  {isBangla ? "PNG, JPG বা WEBP (সর্বোচ্চ ৫MB)" : "Supports PNG, JPG or WEBP (Max 5MB)"}
                </p>
              </div>

              {/* Party Type Selection */}
              <div>
                <Label className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {isBangla ? 'পার্টির ধরন' : 'Party Type'}
                </Label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { value: 'customer', icon: User, label: isBangla ? 'গ্রাহক' : 'Customer', sub: 'Receives sales' },
                    { value: 'supplier', icon: Building2, label: isBangla ? 'সরবরাহকারী' : 'Supplier', sub: 'Provides stock' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => updateForm('type', type.value)}
                      className={cn(
                        'flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center space-y-1',
                        formData.type === type.value
                          ? 'border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/30'
                          : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-muted/40'
                      )}
                    >
                      <type.icon className="h-5 w-5" />
                      <span>{type.label}</span>
                      <span className="text-[10px] text-muted-foreground font-normal">{type.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial & Opening Balance Card */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/40 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                {isBangla ? 'আর্থিক সেটিংস ও ব্যালেন্স' : 'Financial & Balance'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Opening Balance */}
              <div>
                <Label className="mb-2 block text-xs font-medium">
                  {isBangla ? 'ওপেনিং ব্যালেন্স (৳)' : 'Opening Balance (৳)'}
                </Label>
                <Input
                  type="number"
                  value={formData.openingBalance}
                  onChange={(e) => updateForm('openingBalance', e.target.value)}
                  placeholder="0.00"
                  className="h-10 text-sm font-mono"
                />
              </div>

              {/* Balance Direction Toggle */}
              <div>
                <Label className="mb-2 block text-xs font-medium">
                  {isBangla ? 'ব্যালেন্সের দিক' : 'Balance Direction'}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'receive', label: isBangla ? 'পাওনা (To Receive)' : 'To Receive', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500' },
                    { value: 'give', label: isBangla ? 'দেনা (To Give)' : 'To Give', color: 'border-rose-500/50 bg-rose-500/10 text-rose-500' },
                  ].map((dir) => (
                    <button
                      key={dir.value}
                      type="button"
                      onClick={() => updateForm('balanceType', dir.value)}
                      className={cn(
                        'flex items-center justify-center px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer',
                        formData.balanceType === dir.value
                          ? dir.color
                          : 'border-border bg-card text-muted-foreground hover:border-border'
                      )}
                    >
                      {dir.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Credit Limit (for customers) */}
              {formData.type === 'customer' && (
                <div className="pt-2 border-t border-border/40">
                  <Label className="mb-2 block text-xs font-medium flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-amber-500" />
                    {isBangla ? 'ক্রেডিট লিমিট (৳)' : 'Credit Limit (৳)'}
                  </Label>
                  <Input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => updateForm('creditLimit', e.target.value)}
                    placeholder={isBangla ? 'সীমাহীন হলে ফাঁকা রাখুন' : 'Leave empty for unlimited'}
                    className="h-10 text-sm font-mono"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (8 cols): Primary Form Fields */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Information Card */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/40 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                {isBangla ? 'যোগাযোগের সাধারণ তথ্য' : 'Primary Contact Details'}
              </CardTitle>
              <CardDescription className="text-xs">
                {isBangla ? 'পার্টির নাম, ফোন নম্বর এবং ইমেইল ঠিকানা প্রদান করুন' : 'Provide essential identification and communication channels'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {/* Full Name */}
              <div>
                <Label className="mb-2 block text-xs font-semibold">
                  {isBangla ? 'পার্টির পূর্ণ নাম' : 'Party Full Name'} <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  placeholder={isBangla ? 'যেমন: মোহাম্মদ রহিম অথবা রহিম এন্টারপ্রাইজ' : 'e.g. Rahim Enterprise or John Doe'}
                  className="h-11 text-sm font-medium"
                />
              </div>

              {/* Phone & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block text-xs font-semibold flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    {isBangla ? 'ফোন নম্বর' : 'Phone Number'}
                  </Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => updateForm('phone', e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="h-11 text-sm"
                  />
                </div>
                <div>
                  <Label className="mb-2 block text-xs font-semibold flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {isBangla ? 'ইমেইল ঠিকানা' : 'Email Address'}
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    placeholder="example@domain.com"
                    className="h-11 text-sm"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <Label className="mb-2 block text-xs font-semibold flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  {isBangla ? 'ঠিকানা (শপ / বাসা / অফিস)' : 'Full Address (Office / Store)'}
                </Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => updateForm('address', e.target.value)}
                  placeholder={isBangla ? 'হাউস রোড, এলাকা, জেলা...' : 'House, Road, Area, City, Division...'}
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes & Additional Remarks Card */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/40 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                {isBangla ? 'অতিরিক্ত মন্তব্য ও নোট' : 'Notes & Additional Remarks'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div>
                <Label className="mb-2 block text-xs font-semibold">
                  {isBangla ? 'বিশেষ নোট বা মন্তব্য' : 'Notes / Remarks'}
                </Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => updateForm('notes', e.target.value)}
                  placeholder={isBangla ? 'পার্টি সম্পর্কিত যেকোনো অতিরিক্ত তথ্য এখানে লিখুন...' : 'Add any additional context, terms, or notes about this party...'}
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="h-11 px-6 text-sm font-semibold cursor-pointer"
            >
              <X className="h-4 w-4 mr-2" />
              {isBangla ? 'বাতিল করুন' : 'Cancel'}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="h-11 px-8 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-lg cursor-pointer"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                  {isBangla ? 'আপডেট হচ্ছে...' : 'Updating...'}
                </span>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {isBangla ? 'আপডেট করুন' : 'Update Party'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  UserPlus,
  User,
  Phone,
  Mail,
  MapPin,
  Banknote,
  Building2,
  Briefcase,
  Layers,
  Calendar,
  Trash2,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  Landmark,
  Smartphone,
  Info,
  Camera,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/common';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { HRM_BRANCHES } from '@/components/hrm/mock-data';
import { DEPARTMENTS, DESIGNATIONS } from '@/components/hrm/types';
import { cn } from '@/lib/utils';

export default function AddEmployeePage() {
  const { isBangla } = useAppTranslation();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states - General
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Form states - Personal
  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState(`HK-${Math.floor(1000 + Math.random() * 9000)}`);
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [maritalStatus, setMaritalStatus] = useState('Single');
  const [nid, setNid] = useState('');
  const [passport, setPassport] = useState('');
  const [nationality, setNationality] = useState(isBangla ? 'বাংলাদেশী' : 'Bangladeshi');
  const [religion, setReligion] = useState('Islam');

  // Form states - Contact
  const [phoneVal, setPhoneVal] = useState('');
  const [emailVal, setEmailVal] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Spouse');
  const [presentAddress, setPresentAddress] = useState('');
  const [sameAsPresent, setSameAsPresent] = useState(false);
  const [permanentAddress, setPermanentAddress] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka');
  const [postalCode, setPostalCode] = useState('1205');
  const [country, setCountry] = useState(isBangla ? 'বাংলাদেশ' : 'Bangladesh');

  // Form states - Employment
  const [branch, setBranch] = useState(HRM_BRANCHES[0]?.id || 'b1');
  const [department, setDepartment] = useState(DEPARTMENTS[1] || 'Sales');
  const [designation, setDesignation] = useState(DESIGNATIONS[2] || 'Sales Executive');
  const [role, setRole] = useState('Employee');
  const [manager, setManager] = useState('');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [employmentType, setEmploymentType] = useState('Full Time');
  const [workShift, setWorkShift] = useState('Day');
  const [workingDays, setWorkingDays] = useState('5');
  const [probation, setProbation] = useState('Yes');
  const [status, setStatus] = useState('Active');

  // Form states - Salary
  const [salaryVal, setSalaryVal] = useState('');
  const [salaryType, setSalaryType] = useState('Monthly');
  const [paymentMethod, setPaymentMethod] = useState<'Bank' | 'Mobile Banking' | 'Cash'>('Bank');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [mobileBanking, setMobileBanking] = useState('bKash');
  const [mobileWalletNumber, setMobileWalletNumber] = useState('');
  const [allowances, setAllowances] = useState('');
  const [notesVal, setNotesVal] = useState('');

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [, setTouched] = useState<Record<string, boolean>>({});

  // Sync permanent address when "same as present" is checked
  useEffect(() => {
    if (sameAsPresent) {
      setPermanentAddress(presentAddress);
    }
  }, [sameAsPresent, presentAddress]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(isBangla ? 'ছবির সাইজ সর্বোচ্চ ২MB হতে পারে' : 'Image size must be within 2MB');
        return;
      }
      setPhotoUrl(URL.createObjectURL(file));
      toast.success(isBangla ? 'ছবি আপলোড সফল হয়েছে' : 'Photo uploaded successfully');
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info(isBangla ? 'ছবি মুছে ফেলা হয়েছে' : 'Photo removed');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = isBangla ? 'পূর্ণ নাম আবশ্যক' : 'Full name is required';
    }
    if (!employeeId.trim()) {
      newErrors.employeeId = isBangla ? 'কর্মচারী আইডি আবশ্যক' : 'Employee ID is required';
    }
    if (!phoneVal.trim()) {
      newErrors.phone = isBangla ? 'মোবাইল নম্বর আবশ্যক' : 'Phone number is required';
    }
    if (!branch) {
      newErrors.branch = isBangla ? 'শাখা নির্বাচন করুন' : 'Branch is required';
    }
    if (!department) {
      newErrors.department = isBangla ? 'বিভাগ নির্বাচন করুন' : 'Department is required';
    }
    if (!designation) {
      newErrors.designation = isBangla ? 'পদবি নির্বাচন করুন' : 'Designation is required';
    }
    if (!salaryVal || parseFloat(salaryVal) <= 0) {
      newErrors.salary = isBangla ? 'মূল বেতন আবশ্যক' : 'Basic salary is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      fullName: true,
      employeeId: true,
      phone: true,
      branch: true,
      department: true,
      designation: true,
      salary: true,
    });

    if (!validateForm()) {
      toast.error(isBangla ? 'অনুগ্রহ করে সকল আবশ্যক ক্ষেত্রগুলো পূরণ করুন' : 'Please fill all required fields marked with *');

      // Intelligent scroll to first error
      const firstErrorField = document.querySelector('[aria-invalid="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (firstErrorField as HTMLElement).focus?.();
      }
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(
        isBangla
          ? 'নতুন কর্মচারী প্রোফাইল সফলভাবে তৈরি হয়েছে!'
          : 'New employee profile created successfully!'
      );
      router.push('/hrm/employees');
    }, 800);
  };

  const generateNewId = () => {
    const newId = `HK-${Math.floor(1000 + Math.random() * 9000)}`;
    setEmployeeId(newId);
    toast.info(isBangla ? `নতুন আইডি জেনারেট হয়েছে: ${newId}` : `Generated ID: ${newId}`);
  };

  return (
    <div className="w-full space-y-6 pb-16">
      {/* 1. TOP HEADER */}
      <div className="sticky top-0 z-20 -mt-2 -mx-4 px-4 sm:-mx-6 sm:px-6 py-3.5 backdrop-blur-xl bg-background/90 border-b border-border/40 shadow-xs flex items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-3">
          <BackButton fallbackHref="/hrm/employees" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {isBangla ? 'নতুন কর্মচারী যোগ করুন' : 'Add New Employee'}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isBangla
                ? 'একটি সম্পূর্ণ নতুন কর্মচারী প্রোফাইল ও বেতন বিবরণী তৈরি করুন।'
                : 'Create a new employee profile and employment arrangement.'}
            </p>
          </div>
        </div>
      </div>

      {/* FORM CONTAINER */}
      <form onSubmit={handleCreate} className="space-y-6">
        
        {/* ========================================================
            SECTION 1: PERSONAL INFORMATION
            ======================================================== */}
        <Card id="personal" className="border-border/60 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/20 border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <User className="h-4.5 w-4.5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    {isBangla ? 'ব্যক্তিগত তথ্য' : 'Personal Information'}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    {isBangla ? 'মৌলিক পরিচয়, ছবি ও জাতীয়তা সম্পর্কিত বিবরণ' : 'Basic identity, photo, and demographic details'}
                  </CardDescription>
                </div>
              </div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase bg-muted/60 border border-border/40 px-2.5 py-0.5 rounded-full">
                {isBangla ? 'বিভাগ ০১' : 'Section 01'}
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 space-y-6">
            {/* 1.1 Compact Photo Upload */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl border border-border/60 bg-muted/10">
              <div className="relative group shrink-0">
                <div className="h-20 w-20 rounded-2xl border-2 border-dashed border-border/80 bg-background flex items-center justify-center overflow-hidden shadow-inner">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Employee Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-9 w-9 text-muted-foreground/40" />
                  )}
                </div>
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <div>
                  <div className="text-xs font-bold text-foreground uppercase tracking-wider">
                    {isBangla ? 'কর্মচারীর ছবি' : 'Employee Photo'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isBangla
                      ? 'পেশাদার স্পষ্ট ছবি দিন (JPG, PNG বা WEBP, সর্বোচ্চ ২MB)'
                      : 'Upload a clear professional photo (JPG, PNG or WEBP, max 2MB)'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-input"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 text-xs cursor-pointer border-border/60 hover:bg-muted"
                  >
                    <Camera className="h-3.5 w-3.5 mr-1.5 text-primary" />
                    {photoUrl
                      ? isBangla ? 'ছবি পরিবর্তন করুন' : 'Change Photo'
                      : isBangla ? 'ছবি আপলোড করুন' : 'Upload Photo'}
                  </Button>

                  {photoUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePhoto}
                      className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      {isBangla ? 'মুছে ফেলুন' : 'Remove'}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* 1.2 Basic Identity Subsection */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {isBangla ? 'মৌলিক পরিচয়' : 'Basic Identity'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="fullName" className="text-xs font-semibold text-foreground">
                    {isBangla ? 'পূর্ণ নাম' : 'Full Name'} <span className="text-destructive font-bold">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                    }}
                    placeholder={isBangla ? 'যেমন: আবদুর রহমান' : 'e.g. Abdur Rahman'}
                    aria-invalid={!!errors.fullName}
                    className={cn(errors.fullName && 'border-destructive focus-visible:ring-destructive/30')}
                  />
                  {errors.fullName && (
                    <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="employeeId" className="text-xs font-semibold text-foreground">
                      {isBangla ? 'কর্মচারী আইডি' : 'Employee ID'} <span className="text-destructive font-bold">*</span>
                    </Label>
                    <button
                      type="button"
                      onClick={generateNewId}
                      className="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
                      title={isBangla ? 'নতুন আইডি তৈরি করুন' : 'Generate new ID'}
                    >
                      <RefreshCw className="h-3 w-3" />
                      {isBangla ? 'জেনারেট' : 'Auto'}
                    </button>
                  </div>
                  <Input
                    id="employeeId"
                    value={employeeId}
                    onChange={(e) => {
                      setEmployeeId(e.target.value);
                      if (errors.employeeId) setErrors((prev) => ({ ...prev, employeeId: '' }));
                    }}
                    placeholder="e.g. HK-00124"
                    aria-invalid={!!errors.employeeId}
                    className={cn('font-mono font-medium', errors.employeeId && 'border-destructive focus-visible:ring-destructive/30')}
                  />
                  {errors.employeeId && (
                    <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> {errors.employeeId}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 1.3 Personal Details Subsection */}
            <div className="space-y-3 pt-2 border-t border-border/30">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {isBangla ? 'ব্যক্তিগত বিবরণ' : 'Personal Details'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="dob" className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'জন্ম তারিখ' : 'Date of Birth'}
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                    <Input
                      id="dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="pl-9 font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'লিঙ্গ' : 'Gender'}
                  </Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">{isBangla ? 'পুরুষ (Male)' : 'Male'}</SelectItem>
                      <SelectItem value="Female">{isBangla ? 'নারী (Female)' : 'Female'}</SelectItem>
                      <SelectItem value="Other">{isBangla ? 'অন্যান্য (Other)' : 'Other'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'রক্তের গ্রুপ' : 'Blood Group'}
                  </Label>
                  <Select value={bloodGroup} onValueChange={setBloodGroup}>
                    <SelectTrigger className="w-full font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="font-mono">
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'বৈবাহিক অবস্থা' : 'Marital Status'}
                  </Label>
                  <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">{isBangla ? 'অবিবাহিত (Single)' : 'Single'}</SelectItem>
                      <SelectItem value="Married">{isBangla ? 'বিবাহিত (Married)' : 'Married'}</SelectItem>
                      <SelectItem value="Divorced">{isBangla ? 'তালাকপ্রাপ্ত (Divorced)' : 'Divorced'}</SelectItem>
                      <SelectItem value="Widowed">{isBangla ? 'বিধবা/বিপত্নীক (Widowed)' : 'Widowed'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 1.4 Identity & Demographics Subsection */}
            <div className="space-y-3 pt-2 border-t border-border/30">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {isBangla ? 'জাতীয়তা ও পরিচয়পত্র' : 'Identity & Demographics'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nidVal" className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'জাতীয় পরিচয়পত্র নম্বর (NID)' : 'National ID (NID)'}
                  </Label>
                  <Input
                    id="nidVal"
                    value={nid}
                    onChange={(e) => setNid(e.target.value)}
                    placeholder="e.g. 1993XXXXXXXXX"
                    className="font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="passportVal" className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'পাসপোর্ট নম্বর' : 'Passport No'}
                  </Label>
                  <Input
                    id="passportVal"
                    value={passport}
                    onChange={(e) => setPassport(e.target.value)}
                    placeholder="e.g. EGXXXXXXX"
                    className="font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="nationalityVal" className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'জাতীয়তা' : 'Nationality'}
                  </Label>
                  <Input
                    id="nationalityVal"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'ধর্ম' : 'Religion'}
                  </Label>
                  <Select value={religion} onValueChange={setReligion}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Islam">{isBangla ? 'ইসলাম (Islam)' : 'Islam'}</SelectItem>
                      <SelectItem value="Hinduism">{isBangla ? 'হিন্দু (Hinduism)' : 'Hinduism'}</SelectItem>
                      <SelectItem value="Buddhism">{isBangla ? 'বৌদ্ধ (Buddhism)' : 'Buddhism'}</SelectItem>
                      <SelectItem value="Christianity">{isBangla ? 'খ্রিস্টান (Christianity)' : 'Christianity'}</SelectItem>
                      <SelectItem value="Others">{isBangla ? 'অন্যান্য (Others)' : 'Others'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================
            SECTION 2: CONTACT INFORMATION
            ======================================================== */}
        <Card id="contact" className="border-border/60 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/20 border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Phone className="h-4.5 w-4.5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    {isBangla ? 'যোগাযোগের তথ্য' : 'Contact Information'}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    {isBangla ? 'মোবাইল নম্বর, ইমেইল, জরুরি যোগাযোগ ও ঠিকানার বিবরণ' : 'Phone, email, emergency contact and addresses'}
                  </CardDescription>
                </div>
              </div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase bg-muted/60 border border-border/40 px-2.5 py-0.5 rounded-full">
                {isBangla ? 'বিভাগ ০২' : 'Section 02'}
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 space-y-6">
            {/* 2.1 Primary Contact Details */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {isBangla ? 'প্রাথমিক যোগাযোগ' : 'Primary Contact'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phoneVal" className="text-xs font-semibold text-foreground">
                    {isBangla ? 'মোবাইল নম্বর' : 'Phone Number'} <span className="text-destructive font-bold">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                    <Input
                      id="phoneVal"
                      value={phoneVal}
                      onChange={(e) => {
                        setPhoneVal(e.target.value);
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                      }}
                      placeholder="017XXXXXXXX"
                      aria-invalid={!!errors.phone}
                      className={cn('pl-9 font-mono', errors.phone && 'border-destructive focus-visible:ring-destructive/30')}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> {errors.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="emailVal" className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'ইমেইল ঠিকানা' : 'Email Address'}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                    <Input
                      id="emailVal"
                      type="email"
                      value={emailVal}
                      onChange={(e) => setEmailVal(e.target.value)}
                      placeholder="employee@hellokhata.com"
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2.2 Emergency Contact */}
            <div className="space-y-3 pt-2 border-t border-border/30">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {isBangla ? 'জরুরি যোগাযোগ' : 'Emergency Contact'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="emergencyName" className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'যোগাযোগকারীর নাম' : 'Contact Person Name'}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                    <Input
                      id="emergencyName"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder={isBangla ? 'যেমন: ফাতেমা বেগম' : 'e.g. Fatema Begum'}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="emergencyPhone" className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'জরুরি মোবাইল নম্বর' : 'Emergency Phone'}
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                    <Input
                      id="emergencyPhone"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="018XXXXXXXX"
                      className="pl-9 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'সম্পর্ক' : 'Relationship'}
                  </Label>
                  <Select value={emergencyRelation} onValueChange={setEmergencyRelation}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Parent">{isBangla ? 'পিতা/মাতা (Parent)' : 'Parent'}</SelectItem>
                      <SelectItem value="Spouse">{isBangla ? 'স্বামী/স্ত্রী (Spouse)' : 'Spouse'}</SelectItem>
                      <SelectItem value="Sibling">{isBangla ? 'ভাই/বোন (Sibling)' : 'Sibling'}</SelectItem>
                      <SelectItem value="Relative">{isBangla ? 'আত্মীয় (Relative)' : 'Relative'}</SelectItem>
                      <SelectItem value="Friend">{isBangla ? 'বন্ধু (Friend)' : 'Friend'}</SelectItem>
                      <SelectItem value="Other">{isBangla ? 'অন্যান্য (Other)' : 'Other'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 2.3 Address & Location */}
            <div className="space-y-3 pt-2 border-t border-border/30">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {isBangla ? 'ঠিকানা ও অবস্থান' : 'Address & Location'}
                </div>

                {/* Same as present address checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sameAddress"
                    checked={sameAsPresent}
                    onCheckedChange={(checked) => setSameAsPresent(Boolean(checked))}
                  />
                  <label
                    htmlFor="sameAddress"
                    className="text-xs font-medium text-muted-foreground cursor-pointer select-none"
                  >
                    {isBangla ? 'বর্তমান ও স্থায়ী ঠিকানা একই' : 'Permanent address is same as present'}
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="presentAddress" className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'বর্তমান ঠিকানা' : 'Present Address'}
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                    <Input
                      id="presentAddress"
                      value={presentAddress}
                      onChange={(e) => setPresentAddress(e.target.value)}
                      placeholder={isBangla ? 'বাড়ি নং, রোড নং, এলাকা...' : 'House #, Road #, Area / Block...'}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="permanentAddress" className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'স্থায়ী ঠিকানা' : 'Permanent Address'}
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                    <Input
                      id="permanentAddress"
                      value={permanentAddress}
                      disabled={sameAsPresent}
                      onChange={(e) => setPermanentAddress(e.target.value)}
                      placeholder={isBangla ? 'গ্রাম, ডাকঘর, থানা, জেলা...' : 'Village, Post Office, Thana, District...'}
                      className={cn('pl-9', sameAsPresent && 'opacity-60 cursor-not-allowed bg-muted/30')}
                    />
                  </div>
                </div>

                {/* 4-col City, District, Postal, Country */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs font-semibold text-muted-foreground">
                      {isBangla ? 'শহর' : 'City'}
                    </Label>
                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="district" className="text-xs font-semibold text-muted-foreground">
                      {isBangla ? 'জেলা' : 'District'}
                    </Label>
                    <Input id="district" value={district} onChange={(e) => setDistrict(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="postal" className="text-xs font-semibold text-muted-foreground">
                      {isBangla ? 'পোস্টাল কোড' : 'Postal Code'}
                    </Label>
                    <Input id="postal" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="country" className="text-xs font-semibold text-muted-foreground">
                      {isBangla ? 'দেশ' : 'Country'}
                    </Label>
                    <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================
            SECTION 3: EMPLOYMENT INFORMATION
            ======================================================== */}
        <Card id="employment" className="border-border/60 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/20 border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Briefcase className="h-4.5 w-4.5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    {isBangla ? 'কর্মসংস্থান তথ্য' : 'Employment Information'}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    {isBangla ? 'শাখা, বিভাগ, পদবি, ভূমিকা ও কাজের শিফট সংক্রান্ত বিবরণ' : 'Branch, department, designation, role and work terms'}
                  </CardDescription>
                </div>
              </div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase bg-muted/60 border border-border/40 px-2.5 py-0.5 rounded-full">
                {isBangla ? 'বিভাগ ০৩' : 'Section 03'}
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 space-y-6">
            {/* 3.1 Organization Structure */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {isBangla ? 'প্রাতিষ্ঠানিক কাঠামো' : 'Organization Structure'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    {isBangla ? 'শাখা' : 'Branch'} <span className="text-destructive font-bold">*</span>
                  </Label>
                  <Select value={branch} onValueChange={setBranch}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center gap-2 truncate">
                        <Building2 className="h-4 w-4 text-primary shrink-0" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {HRM_BRANCHES.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    {isBangla ? 'বিভাগ' : 'Department'} <span className="text-destructive font-bold">*</span>
                  </Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center gap-2 truncate">
                        <Layers className="h-4 w-4 text-primary shrink-0" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    {isBangla ? 'পদবি' : 'Designation'} <span className="text-destructive font-bold">*</span>
                  </Label>
                  <Select value={designation} onValueChange={setDesignation}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center gap-2 truncate">
                        <Briefcase className="h-4 w-4 text-primary shrink-0" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {DESIGNATIONS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 3.2 Role & Hierarchy */}
            <div className="space-y-3 pt-2 border-t border-border/30">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {isBangla ? 'ভূমিকা ও নিয়োগ' : 'Role & Employment Terms'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    {isBangla ? 'সিস্টেম রোল' : 'System Role'} <span className="text-destructive font-bold">*</span>
                  </Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center gap-2 truncate">
                        <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin (পূর্ণ নিয়ন্ত্রণ)</SelectItem>
                      <SelectItem value="HR">HR Manager (মানবসম্পদ)</SelectItem>
                      <SelectItem value="Manager">Manager (ব্যবস্থাপক)</SelectItem>
                      <SelectItem value="Employee">Employee (সাধারণ কর্মচারী)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="manager" className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'রিপোর্টিং ম্যানেজার' : 'Reporting Manager'}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                    <Input
                      id="manager"
                      value={manager}
                      onChange={(e) => setManager(e.target.value)}
                      placeholder={isBangla ? 'যেমন: মাসুদ রানা' : 'e.g. Masud Rana'}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="joining" className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'যোগদানের তারিখ' : 'Joining Date'}
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                    <Input
                      id="joining"
                      type="date"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      className="pl-9 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3.3 Work Schedule & Status */}
            <div className="space-y-3 pt-2 border-t border-border/30">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {isBangla ? 'কাজের শিফট ও স্ট্যাটাস' : 'Work Schedule & Status'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'চাকরির ধরণ' : 'Employment Type'}
                  </Label>
                  <Select value={employmentType} onValueChange={setEmploymentType}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full Time">{isBangla ? 'স্থায়ী (Full Time)' : 'Full Time'}</SelectItem>
                      <SelectItem value="Part Time">{isBangla ? 'খণ্ডকালীন (Part Time)' : 'Part Time'}</SelectItem>
                      <SelectItem value="Contract">{isBangla ? 'চুক্তিভিত্তিক (Contract)' : 'Contract'}</SelectItem>
                      <SelectItem value="Intern">{isBangla ? 'ইন্টার্ন (Intern)' : 'Intern'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'কর্ম শিফট' : 'Work Shift'}
                  </Label>
                  <Select value={workShift} onValueChange={setWorkShift}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Day">{isBangla ? 'ডে শিফট (Day)' : 'Day Shift'}</SelectItem>
                      <SelectItem value="Night">{isBangla ? 'নাইট শিফট (Night)' : 'Night Shift'}</SelectItem>
                      <SelectItem value="Roster">{isBangla ? 'রোস্টার (Roster)' : 'Roster'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="workdays" className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'কার্যদিবস (সাপ্তাহিক)' : 'Working Days'}
                  </Label>
                  <Select value={workingDays} onValueChange={setWorkingDays}>
                    <SelectTrigger className="w-full font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="font-mono">
                      <SelectItem value="5">{isBangla ? '৫ দিন/সপ্তাহ (5 Days)' : '5 Days/week'}</SelectItem>
                      <SelectItem value="6">{isBangla ? '৬ দিন/সপ্তাহ (6 Days)' : '6 Days/week'}</SelectItem>
                      <SelectItem value="7">{isBangla ? '৭ দিন/সপ্তাহ (7 Days)' : '7 Days/week'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'প্রবেশন সময়?' : 'Probation?'}
                  </Label>
                  <Select value={probation} onValueChange={setProbation}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">{isBangla ? 'হ্যাঁ (Yes)' : 'Yes'}</SelectItem>
                      <SelectItem value="No">{isBangla ? 'না (No)' : 'No'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'স্ট্যাটাস' : 'Status'}
                  </Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </SelectItem>
                      <SelectItem value="Probation">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-amber-500" />
                          Probation
                        </span>
                      </SelectItem>
                      <SelectItem value="On Leave">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                          On Leave
                        </span>
                      </SelectItem>
                      <SelectItem value="Inactive">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-slate-500" />
                          Inactive
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================
            SECTION 4: SALARY & COMPENSATION
            ======================================================== */}
        <Card id="salary" className="border-border/60 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/20 border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                  <Banknote className="h-4.5 w-4.5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    {isBangla ? 'বেতন বিবরণী ও ক্ষতিপূরণ' : 'Salary & Compensation'}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    {isBangla ? 'মূল বেতন, পেমেন্ট মাধ্যম এবং ব্যাংক বা মোবাইল ওয়ালেট তথ্য' : 'Base salary, disbursement method, and payment accounts'}
                  </CardDescription>
                </div>
              </div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase bg-muted/60 border border-border/40 px-2.5 py-0.5 rounded-full">
                {isBangla ? 'বিভাগ ০৪' : 'Section 04'}
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 space-y-6">
            {/* 4.1 Core Compensation */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {isBangla ? 'মূল ক্ষতিপূরণ' : 'Core Compensation'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Basic Salary with prominent ৳ prefix */}
                <div className="space-y-1.5">
                  <Label htmlFor="basicSalary" className="text-xs font-semibold text-foreground">
                    {isBangla ? 'মূল বেতন' : 'Basic Salary'} <span className="text-destructive font-bold">*</span>
                  </Label>
                  <div className="relative flex items-center">
                    <div className="absolute left-0 top-0 bottom-0 px-3 bg-muted/40 border-r border-border/60 rounded-l-md flex items-center justify-center text-sm font-bold text-primary select-none">
                      ৳
                    </div>
                    <Input
                      id="basicSalary"
                      type="number"
                      value={salaryVal}
                      onChange={(e) => {
                        setSalaryVal(e.target.value);
                        if (errors.salary) setErrors((prev) => ({ ...prev, salary: '' }));
                      }}
                      placeholder="35000"
                      aria-invalid={!!errors.salary}
                      className={cn('pl-10 font-mono text-base font-bold text-foreground', errors.salary && 'border-destructive focus-visible:ring-destructive/30')}
                    />
                  </div>
                  {errors.salary && (
                    <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> {errors.salary}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'বেতনের চক্র' : 'Salary Cycle'}
                  </Label>
                  <Select value={salaryType} onValueChange={setSalaryType}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly">{isBangla ? 'মাসিক (Monthly)' : 'Monthly'}</SelectItem>
                      <SelectItem value="Hourly">{isBangla ? 'ঘণ্টাভিত্তিক (Hourly)' : 'Hourly'}</SelectItem>
                      <SelectItem value="Daily">{isBangla ? 'দৈনিক (Daily)' : 'Daily'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}
                  </Label>
                  <Select value={paymentMethod} onValueChange={(val: any) => setPaymentMethod(val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank">{isBangla ? 'ব্যাংক ট্রান্সফার (Bank)' : 'Bank Transfer'}</SelectItem>
                      <SelectItem value="Mobile Banking">{isBangla ? 'মোবাইল ব্যাংকিং (MFS)' : 'Mobile Banking (bKash/Nagad)'}</SelectItem>
                      <SelectItem value="Cash">{isBangla ? 'নগদ / ক্যাশ (Cash)' : 'Cash Payout'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 4.2 Dynamic Payment Details */}
            {paymentMethod === 'Bank' && (
              <div className="space-y-3 pt-2 border-t border-border/30">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Landmark className="h-3.5 w-3.5 text-primary" />
                  {isBangla ? 'ব্যাংকিং বিবরণ' : 'Banking Details'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="bankName" className="text-xs font-semibold text-muted-foreground">
                      {isBangla ? 'ব্যাংকের নাম' : 'Bank Name'}
                    </Label>
                    <Input
                      id="bankName"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. City Bank, BRAC Bank"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="accNumber" className="text-xs font-semibold text-muted-foreground">
                      {isBangla ? 'অ্যাকাউন্ট নম্বর' : 'Account Number'}
                    </Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                      <Input
                        id="accNumber"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="120XXXXXXXXXXXX"
                        className="pl-9 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bankBranch" className="text-xs font-semibold text-muted-foreground">
                      {isBangla ? 'শাখা / রাউটিং নং' : 'Branch / Routing No'}
                    </Label>
                    <Input
                      id="bankBranch"
                      value={bankBranch}
                      onChange={(e) => setBankBranch(e.target.value)}
                      placeholder="e.g. Gulshan Branch"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'Mobile Banking' && (
              <div className="space-y-3 pt-2 border-t border-border/30">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Smartphone className="h-3.5 w-3.5 text-primary" />
                  {isBangla ? 'মোবাইল ওয়ালেট বিবরণ' : 'Mobile Banking (MFS) Details'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      {isBangla ? 'মোবাইল ব্যাংকিং প্রোভাইডার' : 'MFS Provider'}
                    </Label>
                    <Select value={mobileBanking} onValueChange={setMobileBanking}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bKash">bKash (বিকাশ)</SelectItem>
                        <SelectItem value="Nagad">Nagad (নগদ)</SelectItem>
                        <SelectItem value="Rocket">Rocket (রকেট)</SelectItem>
                        <SelectItem value="Upay">Upay (উপায়)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="mobileWalletNumber" className="text-xs font-semibold text-muted-foreground">
                      {isBangla ? 'ওয়ালেট মোবাইল নম্বর' : 'Wallet Account Number'}
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                      <Input
                        id="mobileWalletNumber"
                        value={mobileWalletNumber}
                        onChange={(e) => setMobileWalletNumber(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="pl-9 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'Cash' && (
              <div className="p-3.5 rounded-xl bg-muted/20 border border-border/40 flex items-center gap-3 text-xs text-muted-foreground">
                <Info className="h-4 w-4 text-primary shrink-0" />
                <span>
                  {isBangla
                    ? 'নগদ বেতন পরিশোধ কোম্পানি ক্যাশ রেজিস্টার ও এইচআর পে-রোল রসিদ দ্বারা পরিচালিত হবে।'
                    : 'Cash salary disbursement will be logged via company cashier register and signed payslips.'}
                </span>
              </div>
            )}

            {/* 4.3 Additional Compensation & Notes */}
            <div className="space-y-3 pt-2 border-t border-border/30">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {isBangla ? 'ভাতা ও নির্দেশাবলী' : 'Allowances & Notes'}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="allowance" className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'ভাতা ও অন্যান্য সুবিধা' : 'Allowances & Benefits'}
                  </Label>
                  <Input
                    id="allowance"
                    value={allowances}
                    onChange={(e) => setAllowances(e.target.value)}
                    placeholder={isBangla ? 'যেমন: মেডিকেল: ২০০০, যাতায়াত: ১৫০০' : 'e.g. Medical: 2000, Transport: 1500'}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notesVal" className="text-xs font-semibold text-muted-foreground">
                    {isBangla ? 'বেতন সংক্রান্ত নোট' : 'Payroll Remarks & Notes'}
                  </Label>
                  <Input
                    id="notesVal"
                    value={notesVal}
                    onChange={(e) => setNotesVal(e.target.value)}
                    placeholder={isBangla ? 'অন্য কোনো আর্থিক নির্দেশাবলী...' : 'Special contract terms or bonus criteria...'}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BOTTOM FORM ACTIONS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/40">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push('/hrm/employees')}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            {isBangla ? 'কর্মচারী তালিকায় ফিরে যান' : 'Back to Employee List'}
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none cursor-pointer font-bold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground min-w-[160px]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                  {isBangla ? 'তৈরি হচ্ছে...' : 'Creating...'}
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <UserPlus className="h-4 w-4" />
                  {isBangla ? 'কর্মচারী তৈরি করুন' : 'Create Employee'}
                </span>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

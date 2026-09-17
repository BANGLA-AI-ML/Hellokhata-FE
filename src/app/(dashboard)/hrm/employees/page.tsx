// Hello Khata OS - HRM Employees Page
// হ্যালো খাতা - এইচআরএম কর্মচারী তালিকা পেজ

'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  Search,
  Download,
  Eye,
  Pencil,
  Archive,
  KeyRound,
  MoreHorizontal,
  Filter,
  Mail,
  Phone,
  MapPin,
  Droplets,
  FileText,
  Baby,
  User,
  Building2,
  Banknote,
  ShieldCheck,
  CalendarDays,
  BadgeCheck,
  ChevronRight,
} from 'lucide-react';
import { Button, Input, Card } from '@/components/ui/premium';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerFooter,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useAppTranslation, useCurrency, useDateFormat } from '@/hooks/useAppTranslation';
import { useRouter } from 'next/navigation';
import { HrmPageHeader } from '@/components/hrm/shared/HrmPageHeader';
import { HrmStatCard } from '@/components/hrm/shared/HrmStatCard';
import { HrmDataTable, type HrmColumn } from '@/components/hrm/shared/HrmDataTable';
import { HrmPagination } from '@/components/hrm/shared/HrmPagination';
import { HrmAvatar } from '@/components/hrm/shared/HrmAvatar';
import { EmployeeStatusBadge } from '@/components/hrm/shared/HrmStatusBadge';
import { HRM_EMPLOYEES, HRM_BRANCHES, branchName } from '@/components/hrm/mock-data';
import type { Employee } from '@/components/hrm/types';
import { DEPARTMENTS, DESIGNATIONS } from '@/components/hrm/types';

const PAGE_SIZE = 8;

export default function EmployeesPage() {
  const { isBangla } = useAppTranslation();
  const { formatCurrency } = useCurrency();
  const { formatDate } = useDateFormat();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [designationFilter, setDesignationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Employee | null>(null);
  const [resetTarget, setResetTarget] = useState<Employee | null>(null);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return HRM_EMPLOYEES.filter((e) => {
      if (q && !`${e.name} ${e.employeeId} ${e.phone} ${e.email}`.toLowerCase().includes(q)) return false;
      if (branchFilter !== 'all' && e.branchId !== branchFilter) return false;
      if (deptFilter !== 'all' && e.department !== deptFilter) return false;
      if (designationFilter !== 'all' && e.designation !== designationFilter) return false;
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      return true;
    });
  }, [searchTerm, branchFilter, deptFilter, designationFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const refresh = (fn: () => void) => {
    setLoading(true);
    setTimeout(() => {
      fn();
      setLoading(false);
    }, 500);
  };

  const openDrawer = (e: Employee) => {
    setSelectedEmployee(e);
    setDrawerOpen(true);
  };

  const openAdd = () => {
    router.push('/hrm/employees/new');
  };

  const openEdit = (e: Employee) => {
    setEditingEmployee(e);
    setFormOpen(true);
  };

  const handleArchive = () => {
    if (!archiveTarget) return;
    setArchiveTarget(null);
    toast.success(
      isBangla
        ? `${archiveTarget.name} কে আর্কাইভ করা হয়েছে`
        : `${archiveTarget.name} has been archived`
    );
  };

  const handleResetPassword = () => {
    if (!resetTarget) return;
    setResetTarget(null);
    toast.success(
      isBangla
        ? `${resetTarget.name} এর পাসওয়ার্ড রিসেট করা হয়েছে`
        : `Password reset link sent to ${resetTarget.name}`
    );
  };

  const stats = useMemo(() => {
    const active = HRM_EMPLOYEES.filter((e) => e.status === 'Active').length;
    const onLeave = HRM_EMPLOYEES.filter((e) => e.status === 'On Leave').length;
    const probation = HRM_EMPLOYEES.filter((e) => e.status === 'Probation').length;
    const payroll = HRM_EMPLOYEES.reduce((s, e) => s + e.salary, 0);
    return { active, onLeave, probation, payroll };
  }, []);

  const columns: HrmColumn<Employee>[] = [
    {
      key: 'employee',
      header: isBangla ? 'কর্মচারী' : 'Employee',
      render: (e) => (
        <div className="flex items-center gap-3">
          <HrmAvatar name={e.name} size="sm" />
          <div className="min-w-0">
            <p className="font-medium text-foreground text-sm truncate max-w-[160px]">{e.name}</p>
            <p className="text-xs text-muted-foreground">{e.employeeId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: isBangla ? 'যোগাযোগ' : 'Contact',
      render: (e) => (
        <div className="min-w-0">
          <p className="text-sm text-foreground tabular-nums">{e.phone}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[180px]">{e.email}</p>
        </div>
      ),
    },
    {
      key: 'department',
      header: isBangla ? 'বিভাগ' : 'Department',
      render: (e) => (
        <div>
          <p className="text-sm text-foreground whitespace-nowrap">{e.department}</p>
          <p className="text-xs text-muted-foreground whitespace-nowrap">{e.designation}</p>
        </div>
      ),
    },
    {
      key: 'branch',
      header: isBangla ? 'শাখা' : 'Branch',
      render: (e) => <span className="text-sm text-muted-foreground whitespace-nowrap">{branchName(e.branchId)}</span>,
    },
    {
      key: 'joining',
      header: isBangla ? 'যোগদান' : 'Joined',
      render: (e) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap tabular-nums">
          {formatDate(e.joiningDate)}
        </span>
      ),
    },
    {
      key: 'salary',
      header: isBangla ? 'বেতন' : 'Salary',
      align: 'right',
      render: (e) => (
        <span className="text-sm font-medium text-foreground whitespace-nowrap tabular-nums">
          {formatCurrency(e.salary)}
        </span>
      ),
    },
    {
      key: 'status',
      header: isBangla ? 'স্ট্যাটাস' : 'Status',
      align: 'center',
      render: (e) => <EmployeeStatusBadge status={e.status} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (e) => (
        <div className="flex items-center justify-end gap-1" onClick={(ev) => ev.stopPropagation()}>
          <Button variant="ghost" size="icon-sm" onClick={() => openDrawer(e)} aria-label="View">
            <Eye className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="More">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => openEdit(e)}>
                <Pencil className="h-4 w-4" /> {isBangla ? 'সম্পাদনা' : 'Edit'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/hrm/employees/${e.id}`)}>
                <FileText className="h-4 w-4" /> {isBangla ? 'প্রোফাইল' : 'Profile'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setResetTarget(e)}>
                <KeyRound className="h-4 w-4" /> {isBangla ? 'পাসওয়ার্ড রিসেট' : 'Reset Password'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setArchiveTarget(e)}
                className="text-destructive focus:text-destructive"
              >
                <Archive className="h-4 w-4" /> {isBangla ? 'আর্কাইভ' : 'Archive'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <HrmPageHeader
        title={isBangla ? 'কর্মচারী ব্যবস্থাপনা' : 'Employee Management'}
        titleBn="কর্মচারী ব্যবস্থাপনা"
        subtitle={isBangla ? 'কর্মচারী তালিকা পরিচালনা করুন — যোগ, সম্পাদনা ও প্রোফাইল দেখুন।' : 'Manage your workforce — add, edit and view employee profiles.'}
        subtitleBn="কর্মচারী তালিকা পরিচালনা করুন — যোগ, সম্পাদনা ও প্রোফাইল দেখুন।"
        icon={Users}
        // breadcrumbs={[{ label: isBangla ? 'কর্মচারী' : 'Employees', labelBn: 'কর্মচারী' }]}
        actions={
          <>
            {/* <Button
              variant="outline"
              size="default"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={() => toast.success(isBangla ? 'রপ্তানি শুরু হয়েছে' : 'Export started')}
            >
              <span className="hidden sm:inline">{isBangla ? 'রপ্তানি' : 'Export'}</span>
            </Button> */}
            <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={openAdd}>
              {isBangla ? 'কর্মচারী যোগ করুন' : 'Add Employee'}
            </Button>
          </>
        }
      />

      {/* Stats */}
      {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <HrmStatCard
          title="Total Employees"
          titleBn="মোট কর্মচারী"
          value={String(HRM_EMPLOYEES.length)}
          icon={Users}
          tone="indigo"
          caption="across 5 branches"
          captionBn="৫টি শাখায়"
          index={0}
        />
        <HrmStatCard
          title="Active"
          titleBn="সক্রিয়"
          value={String(stats.active)}
          icon={BadgeCheck}
          tone="emerald"
          trend={{ value: 2.5, isPositive: true }}
          caption="working now"
          captionBn="কর্মরত"
          index={1}
        />
        <HrmStatCard
          title="On Leave"
          titleBn="ছুটিতে"
          value={String(stats.onLeave)}
          icon={CalendarDays}
          tone="warning"
          caption="currently away"
          captionBn="বর্তমানে ছুটিতে"
          index={2}
        />
        <HrmStatCard
          title="Probation"
          titleBn="পরীক্ষামূলক"
          value={String(stats.probation)}
          icon={ShieldCheck}
          tone="sky"
          caption="in probation"
          captionBn="পরীক্ষামূলক সময়ে"
          index={3}
        />
      </div> */}

      {/* Toolbar */}
      <Card padding="lg">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder={isBangla ? 'নাম, আইডি, ফোন বা ইমেইল খুঁজুন…' : 'Search name, ID, phone or email…'}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showFilters ? 'secondary' : 'outline'}
                size="default"
                leftIcon={<Filter className="h-4 w-4" />}
                onClick={() => setShowFilters((v) => !v)}
              >
                {isBangla ? 'ফিল্টার' : 'Filters'}
                {branchFilter !== 'all' || deptFilter !== 'all' || statusFilter !== 'all' || designationFilter !== 'all' ? (
                  <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                ) : null}
              </Button>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {isBangla
                  ? `${filtered.length} জন ফলাফল`
                  : `${filtered.length} result${filtered.length === 1 ? '' : 's'}`}
              </span>
            </div>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1"
            >
              <Select
                value={branchFilter}
                onValueChange={(v) => {
                  setBranchFilter(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isBangla ? 'শাখা' : 'Branch'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isBangla ? 'সব শাখা' : 'All branches'}</SelectItem>
                  {HRM_BRANCHES.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={deptFilter}
                onValueChange={(v) => {
                  setDeptFilter(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isBangla ? 'বিভাগ' : 'Department'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isBangla ? 'সব বিভাগ' : 'All departments'}</SelectItem>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={designationFilter}
                onValueChange={(v) => {
                  setDesignationFilter(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isBangla ? 'পদবি' : 'Designation'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isBangla ? 'সব পদবি' : 'All designations'}</SelectItem>
                  {DESIGNATIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isBangla ? 'স্ট্যাটাস' : 'Status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isBangla ? 'সব স্ট্যাটাস' : 'All statuses'}</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Probation">Probation</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Table */}
      <HrmDataTable
        columns={columns}
        data={paged}
        keyField={(e) => e.id}
        loading={loading}
        skeletonRows={6}
        emptyIcon={Users}
        emptyTitle={isBangla ? 'কোনো কর্মচারী পাওয়া যায়নি' : 'No employees found'}
        emptyTitleBn="কোনো কর্মচারী পাওয়া যায়নি"
        emptyDescription={isBangla ? 'অন্য ফিল্টার ব্যবহার করে দেখুন বা নতুন কর্মচারী যোগ করুন।' : 'Try different filters or add a new employee.'}
        emptyDescriptionBn="অন্য ফিল্টার ব্যবহার করে দেখুন বা নতুন কর্মচারী যোগ করুন।"
        emptyAction={
          <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={openAdd}>
            {isBangla ? 'কর্মচারী যোগ করুন' : 'Add Employee'}
          </Button>
        }
        onRowClick={openDrawer}
        isBangla={isBangla}
        footer={
          <HrmPagination
            currentPage={safePage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={(p) => {
              setCurrentPage(p);
              refresh(() => {});
            }}
          />
        }
      />

      {/* Details Drawer */}
      <Drawer direction="right" open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="w-full max-w-md">
          {selectedEmployee && (
            <>
              <DrawerHeader className="border-b border-border px-5 pb-4">
                <div className="flex items-center gap-3">
                  <HrmAvatar name={selectedEmployee.name} size="lg" />
                  <div className="min-w-0 flex-1">
                    <DrawerTitle className="text-lg font-semibold text-foreground truncate">
                      {selectedEmployee.name}
                    </DrawerTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedEmployee.employeeId} · {selectedEmployee.designation}
                    </p>
                    <div className="mt-1.5">
                      <EmployeeStatusBadge status={selectedEmployee.status} />
                    </div>
                  </div>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon-sm">
                      <ChevronRight className="h-4 w-4 rotate-180" />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <DetailChip icon={Building2} label={isBangla ? 'বিভাগ' : 'Department'} value={selectedEmployee.department} />
                  <DetailChip icon={ShieldCheck} label={isBangla ? 'শিফট' : 'Shift'} value={selectedEmployee.shift} />
                  <DetailChip icon={MapPin} label={isBangla ? 'শাখা' : 'Branch'} value={branchName(selectedEmployee.branchId)} />
                  <DetailChip icon={CalendarDays} label={isBangla ? 'যোগদান' : 'Joined'} value={formatDate(selectedEmployee.joiningDate)} />
                  <DetailChip icon={Banknote} label={isBangla ? 'বেতন' : 'Salary'} value={formatCurrency(selectedEmployee.salary)} />
                  <DetailChip icon={User} label={isBangla ? 'লিঙ্গ' : 'Gender'} value={selectedEmployee.gender} />
                  <DetailChip icon={Droplets} label="Blood" value={selectedEmployee.bloodGroup} />
                  <DetailChip icon={Baby} label="NID" value={selectedEmployee.nid} />
                </div>

                <Divider />

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {isBangla ? 'যোগাযোগ' : 'Contact'}
                  </h4>
                  <div className="space-y-2.5">
                    <ContactRow icon={Phone} label={isBangla ? 'মোবাইল' : 'Phone'} value={selectedEmployee.phone} />
                    <ContactRow icon={Mail} label="Email" value={selectedEmployee.email} />
                    <ContactRow icon={MapPin} label={isBangla ? 'ঠিকানা' : 'Address'} value={selectedEmployee.address} />
                    <ContactRow icon={BadgeCheck} label={isBangla ? 'জরুরি যোগাযোগ' : 'Emergency'} value={selectedEmployee.emergencyContact} />
                  </div>
                </div>
              </div>

              <DrawerFooter className="border-t border-border px-5 py-4 flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  leftIcon={<Pencil className="h-4 w-4" />}
                  onClick={() => {
                    setDrawerOpen(false);
                    openEdit(selectedEmployee);
                  }}
                >
                  {isBangla ? 'সম্পাদনা' : 'Edit'}
                </Button>
                <Button
                  className="flex-1"
                  leftIcon={<FileText className="h-4 w-4" />}
                  onClick={() => {
                    setDrawerOpen(false);
                    router.push(`/hrm/employees/${selectedEmployee.id}`);
                  }}
                >
                  {isBangla ? 'প্রোফাইল' : 'Profile'}
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* Add / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee
                ? isBangla
                  ? 'কর্মচারী সম্পাদনা'
                  : `Edit ${editingEmployee.name}`
                : isBangla
                  ? 'নতুন কর্মচারী যোগ করুন'
                  : 'Add New Employee'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="emp-name">{isBangla ? 'পুরো নাম *' : 'Full Name *'}</Label>
              <Input id="emp-name" placeholder="e.g. Abdur Rahman" defaultValue={editingEmployee?.name} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emp-phone">{isBangla ? 'মোবাইল *' : 'Phone *'}</Label>
              <Input id="emp-phone" placeholder="01XXXXXXXXX" defaultValue={editingEmployee?.phone} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emp-email">{isBangla ? 'ইমেইল' : 'Email'}</Label>
              <Input id="emp-email" type="email" placeholder="name@hellokhata.com" defaultValue={editingEmployee?.email} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emp-salary">{isBangla ? 'বেতন (৳) *' : 'Salary (৳) *'}</Label>
              <Input id="emp-salary" type="number" placeholder="30000" defaultValue={editingEmployee?.salary} />
            </div>
            <div className="space-y-1.5">
              <Label>{isBangla ? 'শাখা *' : 'Branch *'}</Label>
              <Select defaultValue={editingEmployee?.branchId || HRM_BRANCHES[0].id}>
                <SelectTrigger>
                  <SelectValue placeholder={isBangla ? 'শাখা নির্বাচন' : 'Select branch'} />
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
              <Label>{isBangla ? 'বিভাগ *' : 'Department *'}</Label>
              <Select defaultValue={editingEmployee?.department || DEPARTMENTS[1]}>
                <SelectTrigger>
                  <SelectValue placeholder={isBangla ? 'বিভাগ নির্বাচন' : 'Select department'} />
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
              <Label>{isBangla ? 'পদবি *' : 'Designation *'}</Label>
              <Select defaultValue={editingEmployee?.designation || DESIGNATIONS[2]}>
                <SelectTrigger>
                  <SelectValue placeholder={isBangla ? 'পদবি নির্বাচন' : 'Select designation'} />
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
            <div className="space-y-1.5">
              <Label>{isBangla ? 'স্ট্যাটাস' : 'Status'}</Label>
              <Select defaultValue={editingEmployee?.status || 'Active'}>
                <SelectTrigger>
                  <SelectValue placeholder={isBangla ? 'স্ট্যাটাস' : 'Status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Probation">Probation</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="emp-address">{isBangla ? 'ঠিকানা' : 'Address'}</Label>
              <Input id="emp-address" placeholder={isBangla ? 'বাড়ি, রোড, এলাকা, ঢাকা' : 'House, Road, Area, Dhaka'} defaultValue={editingEmployee?.address} />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">{isBangla ? 'বাতিল' : 'Cancel'}</Button>
            </DialogClose>
            <Button
              onClick={() => {
                setFormOpen(false);
                toast.success(
                  editingEmployee
                    ? isBangla
                      ? 'কর্মচারী আপডেট হয়েছে'
                      : 'Employee updated successfully'
                    : isBangla
                      ? 'নতুন কর্মচারী যোগ হয়েছে'
                      : 'Employee added successfully'
                );
              }}
            >
              {editingEmployee ? (isBangla ? 'আপডেট করুন' : 'Save Changes') : (isBangla ? 'যোগ করুন' : 'Add Employee')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Confirm */}
      <Dialog open={!!archiveTarget} onOpenChange={(o) => !o && setArchiveTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isBangla ? 'কর্মচারী আর্কাইভ করুন?' : 'Archive employee?'}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {archiveTarget
              ? isBangla
                ? `${archiveTarget.name} কে আর্কাইভ করলে তিনি আর সক্রিয় কর্মচারী তালিকায় থাকবেন না।`
                : `${archiveTarget.name} will no longer appear in the active employee list. You can restore anytime.`
              : ''}
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">{isBangla ? 'বাতিল' : 'Cancel'}</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleArchive}>
              <Archive className="h-4 w-4" />
              {isBangla ? 'আর্কাইভ করুন' : 'Archive'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password */}
      <Dialog open={!!resetTarget} onOpenChange={(o) => !o && setResetTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isBangla ? 'পাসওয়ার্ড রিসেট' : 'Reset password'}</DialogTitle>
          </DialogHeader>
          <div className="flex items-start gap-3 rounded-xl border border-[rgba(255,255,255,0.04)] bg-muted/30 p-3">
            <KeyRound className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              {resetTarget
                ? isBangla
                  ? `${resetTarget.name} এর লগইন পাসওয়ার্ড রিসেট করতে একটি লিংক পাঠানো হবে।`
                  : `A password reset link will be sent to ${resetTarget.email || resetTarget.phone}.`
                : ''}
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">{isBangla ? 'বাতিল' : 'Cancel'}</Button>
            </DialogClose>
            <Button onClick={handleResetPassword}>
              <KeyRound className="h-4 w-4" />
              {isBangla ? 'লিংক পাঠান' : 'Send Link'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.04)] bg-muted/20 p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="text-sm font-medium text-foreground truncate">{value}</p>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />;
}

'use client';

import React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { LucideIcon } from 'lucide-react';

interface FinancePageHeaderProps {
  pageName: string;
  pageNameBn?: string;
  description: string;
  descriptionBn?: string;
  icon?: LucideIcon;
  parentName?: string;
  parentNameBn?: string;
  parentHref?: string;
}

export function FinancePageHeader({
  pageName,
  pageNameBn,
  description,
  descriptionBn,
  icon: Icon,
  parentName = 'Finance & Accounting',
  parentNameBn = 'অর্থায়ন ও হিসাববিজ্ঞান',
  parentHref,
}: FinancePageHeaderProps) {
  const { isBangla } = useAppTranslation();
  
  const displayName = isBangla && pageNameBn ? pageNameBn : pageName;
  const displayDescription = isBangla && descriptionBn ? descriptionBn : description;
  const displayParentName = isBangla && parentNameBn ? parentNameBn : parentName;

  return (
    <div className="space-y-4 mb-6">
      {/* <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-muted-foreground hover:text-foreground">
              {isBangla ? 'ড্যাশবোর্ড' : 'Dashboard'}
            </BreadcrumbLink>
          </BreadcrumbItem>
          {displayParentName && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {parentHref ? (
                  <BreadcrumbLink href={parentHref} className="text-muted-foreground hover:text-foreground">
                    {displayParentName}
                  </BreadcrumbLink>
                ) : (
                  <span className="text-muted-foreground">
                    {displayParentName}
                  </span>
                )}
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium text-foreground max-w-[200px] truncate">
              {displayName}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb> */}
      
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="h-12 w-12 rounded-xl bg-indigo-subtle flex items-center justify-center shrink-0">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        )}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {displayName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {displayDescription}
          </p>
        </div>
      </div>
    </div>
  );
}

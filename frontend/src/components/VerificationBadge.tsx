import React from 'react';
import { CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

interface Props {
  status: 'verified' | 'pending_review' | 'placeholder' | string;
  reviewer?: string;
  source?: string;
  className?: string;
}

export const VerificationBadge: React.FC<Props> = ({
  status,
  reviewer,
  source,
  className = ''
}) => {
  if (status === 'verified') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 ${className}`}>
        <ShieldCheck className="w-3.5 h-3.5 text-indigo-brand dark:text-blue-400 flex-shrink-0" />
        <span>Verified ISL Sign</span>
        {reviewer && <span className="text-navy-muted dark:text-slate-400 font-normal text-[10px] hidden sm:inline">({reviewer})</span>}
      </div>
    );
  }

  if (status === 'pending_review') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 ${className}`}>
        <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <span>Pending ISL Review</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${className}`}>
      <AlertCircle className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
      <span>Verified ISL demonstration will be added here</span>
    </div>
  );
};

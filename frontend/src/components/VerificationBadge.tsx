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
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 ${className}`}>
        <ShieldCheck className="w-3.5 h-3.5 text-indigo-brand flex-shrink-0" />
        <span>Verified ISL Sign</span>
        {reviewer && <span className="text-navy-muted font-normal text-[10px] hidden sm:inline">({reviewer})</span>}
      </div>
    );
  }

  if (status === 'pending_review') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
        <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
        <span>Pending ISL Review</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
      <AlertCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
      <span>Verified ISL demonstration will be added here</span>
    </div>
  );
};

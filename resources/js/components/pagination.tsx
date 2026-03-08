import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type PaginationProps = {
    totalItems: number;
    pageSize: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];
    from: number;
    to: number;
    className?: string;
};

export function Pagination({
    totalItems,
    pageSize,
    currentPage,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50],
    from,
    to,
    className
}: PaginationProps) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    return (
        <div className={cn(
            "flex flex-col gap-4 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between bg-white",
            className
        )}>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                    Showing <span className="text-slate-900">{from}</span>‑<span className="text-slate-900">{to}</span> of <span className="text-slate-900">{totalItems}</span> items
                </span>
                
                {onPageSizeChange && (
                    <div className="flex items-center gap-2">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Show:</span>
                         <select 
                            value={pageSize} 
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="h-8 border border-slate-200 bg-slate-50/50 px-2 text-xs font-bold outline-none focus:border-[#147da2] transition cursor-pointer"
                         >
                            {pageSizeOptions.map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                         </select>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-center gap-1.5">
                <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="inline-flex h-9 min-w-[36px] items-center justify-center border border-slate-200 bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600 transition hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="h-3.5 w-3.5 sm:mr-1" />
                    <span className="hidden sm:inline">Previous</span>
                </button>
                
                <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => {
                            if (totalPages <= 5) return true;
                            if (p === 1 || p === totalPages) return true;
                            if (p >= currentPage - 1 && p <= currentPage + 1) return true;
                            return false;
                        })
                        .map((p, i, arr) => {
                            const prev = arr[i - 1];
                            const showEllipsis = prev && p - prev > 1;
                            
                            return (
                                <div key={p} className="flex items-center gap-1">
                                    {showEllipsis && <span className="px-1 text-slate-400 text-xs font-bold">...</span>}
                                    <button
                                        type="button"
                                        onClick={() => onPageChange(p)}
                                        className={cn(
                                            "inline-flex h-9 min-w-[36px] items-center justify-center border text-[11px] font-black transition",
                                            currentPage === p
                                                ? "border-[#147da2] bg-[#147da2] text-white shadow-lg shadow-[#147da2]/20"
                                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                        )}
                                    >
                                        {p}
                                    </button>
                                </div>
                            );
                        })
                    }
                </div>

                <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="inline-flex h-9 min-w-[36px] items-center justify-center border border-slate-200 bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600 transition hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-3.5 w-3.5 sm:ml-1" />
                </button>
            </div>
        </div>
    );
}

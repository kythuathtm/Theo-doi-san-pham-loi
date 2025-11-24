
import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalItems, itemsPerPage, onPageChange, onItemsPerPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalItems === 0) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pageSizeOptions = [10, 20, 50, 100];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <p className="text-sm text-slate-700">
          Hiển thị <span className="font-medium">{startItem}</span> - <span className="font-medium">{endItem}</span> trên <span className="font-medium">{totalItems}</span> kết quả
        </p>
        
        <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-xs text-slate-500 font-medium">Hiển thị:</label>
            <select
                id="pageSize"
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                className="block w-full rounded-md border-slate-300 py-1.5 pl-3 pr-8 text-xs font-medium focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm bg-slate-50"
            >
                {pageSizeOptions.map(size => (
                    <option key={size} value={size}>{size} / trang</option>
                ))}
            </select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-2 py-2 rounded-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          <ChevronLeftIcon className="h-5 w-5" />
          <span className="hidden sm:inline ml-1">Trước</span>
        </button>
        <span className="text-sm text-slate-700 font-medium px-2">
           {currentPage} / {totalPages || 1}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages || totalPages === 0}
          className="relative inline-flex items-center px-2 py-2 rounded-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          <span className="hidden sm:inline mr-1">Sau</span>
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default React.memo(Pagination);

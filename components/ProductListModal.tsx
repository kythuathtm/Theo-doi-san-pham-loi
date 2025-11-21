
import React, { useRef } from 'react';
import { XIcon, ArrowUpTrayIcon } from './Icons';
import * as XLSX from 'xlsx';

interface Product {
  maSanPham: string;
  dongSanPham: string;
  tenThuongMai: string;
  nhanHang?: string;
}

interface Props {
  products: Product[];
  onClose: () => void;
  onImport: (newProducts: Product[]) => void;
  currentUserRole: string;
}

const ProductListModal: React.FC<Props> = ({ products, onClose, onImport, currentUserRole }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const data = event.target?.result;
        if (!data) return;

        try {
            // Read the Excel file
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Get the first worksheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            const newProducts: Product[] = [];

            jsonData.forEach((row: any) => {
                // Map common header names to our data structure
                const keys = Object.keys(row);
                const getVal = (keywords: string[]) => {
                    const key = keys.find(k => keywords.some(kw => k.toLowerCase().includes(kw.toLowerCase())));
                    return key ? row[key] : '';
                };

                const maSanPham = getVal(['Mã SP', 'Mã sản phẩm', 'Code', 'Ma San Pham']);
                const dongSanPham = getVal(['Dòng SP', 'Dòng sản phẩm', 'Type', 'Dong San Pham']);
                const tenThuongMai = getVal(['Tên TM', 'Tên thương mại', 'Name', 'Ten Thuong Mai']);
                const nhanHang = getVal(['Nhãn hàng', 'Nhan Hang', 'Brand']);

                if (maSanPham && (dongSanPham || tenThuongMai)) {
                    newProducts.push({
                        maSanPham: String(maSanPham).trim(),
                        dongSanPham: String(dongSanPham || '').trim(),
                        tenThuongMai: String(tenThuongMai || '').trim(),
                        nhanHang: nhanHang ? String(nhanHang).trim() : undefined
                    });
                }
            });

            if (newProducts.length > 0) {
                onImport(newProducts);
            } else {
                alert("Không tìm thấy dữ liệu sản phẩm hợp lệ. Vui lòng kiểm tra tiêu đề cột (Ví dụ: Mã sản phẩm, Dòng sản phẩm, Tên thương mại, Nhãn hàng).");
            }

        } catch (error) {
            console.error("Lỗi đọc file:", error);
            alert("Đã xảy ra lỗi khi đọc file Excel.");
        }
        
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };
    
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-white">
          <h2 className="text-xl font-bold text-slate-800">Danh sách Sản phẩm</h2>
          <div className="flex items-center space-x-2">
             {/* Hidden File Input */}
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".xlsx, .xls"
             />
             
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm"
                title="Import từ file Excel"
             >
                <ArrowUpTrayIcon className="h-4 w-4 mr-1.5" />
                Import Excel
             </button>

            <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors">
                <XIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mã sản phẩm</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dòng sản phẩm</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tên thương mại</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nhãn hàng</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {products.map((product, index) => (
                <tr key={`${product.maSanPham}-${index}`} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-600">{product.maSanPham}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{product.dongSanPham}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{product.tenThuongMai}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{product.nhanHang || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end p-4 bg-white border-t border-slate-200">
            <div className="mr-auto text-xs text-slate-500 italic self-center">
                * Import hỗ trợ file Excel (.xlsx, .xls) với các cột: Mã sản phẩm, Dòng sản phẩm, Tên thương mại, Nhãn hàng.
            </div>
          <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductListModal;

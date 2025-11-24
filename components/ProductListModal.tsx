
import React, { useRef, useState } from 'react';
import { XIcon, ArrowUpTrayIcon, TrashIcon, PlusIcon, CheckCircleIcon } from './Icons';
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
  onAdd: (product: Product) => void;
  onDelete: (maSanPham: string) => void;
  currentUserRole: string;
}

const ProductListModal: React.FC<Props> = ({ products, onClose, onImport, onAdd, onDelete, currentUserRole }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for search and manual add
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState<Product>({
      maSanPham: '',
      dongSanPham: '',
      tenThuongMai: '',
      nhanHang: 'HTM'
  });

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
                alert("Không tìm thấy dữ liệu sản phẩm hợp lệ. Vui lòng kiểm tra tiêu đề cột.");
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

  const handleManualAdd = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newProduct.maSanPham || !newProduct.tenThuongMai) {
          alert("Vui lòng nhập Mã sản phẩm và Tên thương mại");
          return;
      }
      onAdd(newProduct);
      setNewProduct({ maSanPham: '', dongSanPham: '', tenThuongMai: '', nhanHang: 'HTM' });
      setIsAdding(false); // Close form after add
  };

  // Filter products
  const filteredProducts = products.filter(p => 
      p.maSanPham.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.tenThuongMai.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.dongSanPham.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] flex flex-col overflow-hidden ring-1 ring-black/5">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Danh sách Sản phẩm</h2>
            <p className="text-sm text-slate-500 mt-1">Quản lý cơ sở dữ liệu sản phẩm ({products.length} mã)</p>
          </div>
          <div className="flex items-center space-x-2">
             <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-48 hidden sm:block"
             />

             {/* Hidden File Input */}
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".xlsx, .xls"
             />
             
             <button 
                onClick={() => setIsAdding(!isAdding)}
                className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm ${isAdding ? 'bg-slate-100 text-slate-700' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                title="Thêm thủ công"
             >
                <PlusIcon className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">{isAdding ? 'Đóng' : 'Thêm'}</span>
             </button>

             <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                title="Import từ file Excel"
             >
                <ArrowUpTrayIcon className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Import</span>
             </button>

            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors ml-2">
                <XIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Add New Product Form (Collapsible) */}
        {isAdding && (
            <div className="p-5 bg-blue-50 border-b border-blue-100 animate-fade-in-up">
                <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-3">Thêm sản phẩm mới</h4>
                <form onSubmit={handleManualAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-blue-700 mb-1">Mã sản phẩm *</label>
                        <input 
                            type="text" 
                            required
                            placeholder="VD: SP001"
                            value={newProduct.maSanPham}
                            onChange={(e) => setNewProduct({...newProduct, maSanPham: e.target.value})}
                            className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                    <div className="sm:col-span-4">
                        <label className="block text-xs font-semibold text-blue-700 mb-1">Tên thương mại *</label>
                        <input 
                            type="text" 
                            required
                            placeholder="Tên sản phẩm đầy đủ"
                            value={newProduct.tenThuongMai}
                            onChange={(e) => setNewProduct({...newProduct, tenThuongMai: e.target.value})}
                            className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                    <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-blue-700 mb-1">Dòng sản phẩm</label>
                        <input 
                            type="text" 
                            placeholder="Loại sản phẩm"
                            value={newProduct.dongSanPham}
                            onChange={(e) => setNewProduct({...newProduct, dongSanPham: e.target.value})}
                            className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-blue-700 mb-1">Nhãn hàng</label>
                         <select 
                            value={newProduct.nhanHang} 
                            onChange={(e) => setNewProduct({...newProduct, nhanHang: e.target.value})}
                            className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option value="HTM">HTM</option>
                            <option value="VMA">VMA</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </div>
                    <div className="sm:col-span-1">
                        <button 
                            type="submit"
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors flex items-center justify-center"
                            title="Lưu"
                        >
                            <CheckCircleIcon className="h-5 w-5" />
                        </button>
                    </div>
                </form>
            </div>
        )}

        {/* Product Table */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6">
          <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-xl bg-white">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-32 sticky top-0 bg-slate-50">Mã SP</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 bg-slate-50">Tên thương mại</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 bg-slate-50">Dòng SP</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-32 sticky top-0 bg-slate-50">Nhãn hàng</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider w-20 sticky top-0 bg-slate-50">Xóa</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredProducts.map((product, index) => (
                  <tr key={`${product.maSanPham}-${index}`} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-mono font-bold text-slate-600 bg-slate-50/30">{product.maSanPham}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-slate-800">{product.tenThuongMai}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-600">{product.dongSanPham}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${
                            product.nhanHang === 'HTM' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            product.nhanHang === 'VMA' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                            {product.nhanHang || 'Khác'}
                        </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-right text-sm">
                        <button 
                            onClick={() => onDelete(product.maSanPham)}
                            className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Xóa sản phẩm này"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                    <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 italic">
                            Không tìm thấy sản phẩm nào.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Footer info */}
        <div className="flex justify-between items-center p-4 bg-white border-t border-slate-200 text-xs text-slate-500">
            <div>
                 * Import hỗ trợ file Excel (.xlsx) với các cột: Mã sản phẩm, Tên thương mại, Dòng sản phẩm, Nhãn hàng.
            </div>
            <button onClick={onClose} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-2 px-6 rounded-xl shadow-sm transition-colors">
                Đóng
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProductListModal;

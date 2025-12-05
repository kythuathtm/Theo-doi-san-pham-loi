
import { useState, useEffect } from 'react';
import { Product, ToastType } from '../types';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch, query, getDocs } from 'firebase/firestore';

const LS_PRODUCTS = 'app_products_data';

const MOCK_PRODUCTS: Product[] = [
    { maSanPham: 'SP001', tenThuongMai: 'Kim lấy máu chân không', tenThietBi: 'Kim lấy máu', dongSanPham: 'Vật tư tiêu hao', nhanHang: 'HTM', GPLH: '123/BYT', donViTinh: 'Hộp' },
    { maSanPham: 'SP002', tenThuongMai: 'Ống nghiệm Serum', tenThietBi: 'Ống nghiệm', dongSanPham: 'Ống nghiệm', nhanHang: 'HTM', GPLH: '456/BYT', donViTinh: 'Khay' },
    { maSanPham: 'SP003', tenThuongMai: 'Ống nghiệm EDTA', tenThietBi: 'Ống nghiệm', dongSanPham: 'Ống nghiệm', nhanHang: 'VMA', GPLH: '789/BYT', donViTinh: 'Khay' },
];

export const useProducts = (showToast: (msg: string, type: ToastType) => void) => {
  const [products, setProducts] = useState<Product[]>(() => {
      try {
          const saved = localStorage.getItem(LS_PRODUCTS);
          return saved ? JSON.parse(saved) : MOCK_PRODUCTS;
      } catch { return MOCK_PRODUCTS; }
  });

  useEffect(() => {
    let unsubscribe = () => {};
    try {
        unsubscribe = onSnapshot(collection(db, "products"), 
            (snapshot) => {
                const productsData = snapshot.docs.map(doc => doc.data() as Product);
                // Only update if we actually got data (not empty due to permissions)
                // If permission denied, this callback might not even fire with data
                if (productsData.length > 0 || !snapshot.metadata.fromCache) {
                    setProducts(productsData);
                    localStorage.setItem(LS_PRODUCTS, JSON.stringify(productsData));
                }
            },
            (error) => {
                console.warn("Product: Firestore unavailable (permissions/network). Using local data.");
                // Keep using initial state (local storage or mock)
            }
        );
    } catch (e) {
        console.warn("Product: Firebase Error", e);
    }
    return () => unsubscribe();
  }, []);

  const addProduct = async (product: Product) => {
    try {
        // Optimistic
        const newProducts = [...products.filter(p => p.maSanPham !== product.maSanPham), product];
        setProducts(newProducts);
        localStorage.setItem(LS_PRODUCTS, JSON.stringify(newProducts));

        await setDoc(doc(db, "products", product.maSanPham), product);
        showToast('Thêm sản phẩm thành công', 'success');
    } catch (error) {
        console.warn("Offline add: product");
        showToast('Đã lưu sản phẩm (Offline mode)', 'info');
    }
  };

  const deleteProduct = async (maSanPham: string) => {
    if(!window.confirm(`Xóa sản phẩm ${maSanPham}?`)) return;
    try {
        // Optimistic
        const newProducts = products.filter(p => p.maSanPham !== maSanPham);
        setProducts(newProducts);
        localStorage.setItem(LS_PRODUCTS, JSON.stringify(newProducts));

        await deleteDoc(doc(db, "products", maSanPham));
        showToast('Xóa sản phẩm thành công', 'info');
    } catch (error) {
        console.warn("Offline delete: product");
        showToast('Đã xóa sản phẩm (Offline mode)', 'info');
    }
  };

  const deleteAllProducts = async () => {
    if (!window.confirm("CẢNH BÁO: Xóa toàn bộ sản phẩm?")) return;

    try {
        setProducts([]);
        localStorage.removeItem(LS_PRODUCTS);

        const q = query(collection(db, "products"));
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        
        showToast("Đã xóa toàn bộ dữ liệu sản phẩm.", "info");
    } catch (error) {
        console.warn("Offline delete all: products");
        showToast("Đã xóa dữ liệu (Offline mode).", "info");
    }
  };

  const importProducts = async (newProducts: Product[]) => {
      try {
          // Optimistic merge
          const combined = [...products];
          newProducts.forEach(np => {
              const idx = combined.findIndex(p => p.maSanPham === np.maSanPham);
              if (idx >= 0) combined[idx] = np;
              else combined.push(np);
          });
          setProducts(combined);
          localStorage.setItem(LS_PRODUCTS, JSON.stringify(combined));

          // Try Batch Write
          const batch = writeBatch(db);
          newProducts.forEach((p) => {
              const ref = doc(db, "products", p.maSanPham);
              batch.set(ref, p);
          });
          await batch.commit();
          
          showToast(`Đã import thành công ${newProducts.length} sản phẩm.`, 'success');
          return true;
      } catch (error) {
          console.warn("Offline import: products");
          showToast(`Đã import ${newProducts.length} sản phẩm (Offline mode).`, 'success');
          return true;
      }
  };

  return {
    products,
    addProduct,
    deleteProduct,
    deleteAllProducts,
    importProducts
  };
};

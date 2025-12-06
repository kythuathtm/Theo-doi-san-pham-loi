
import { useState, useEffect } from 'react';
import { Product, ToastType } from '../types';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch, query, getDocs } from 'firebase/firestore';

const LS_PRODUCTS = 'app_products_data';

// Removed mock data as requested
const MOCK_PRODUCTS: Product[] = [];

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
        const productsRef = collection(db, "products");
        unsubscribe = onSnapshot(productsRef, 
            (snapshot) => {
                const productsData = snapshot.docs.map(doc => doc.data() as Product);
                if (productsData.length > 0 || !snapshot.metadata.fromCache) {
                    setProducts(productsData);
                    localStorage.setItem(LS_PRODUCTS, JSON.stringify(productsData));
                }
            },
            (error: any) => {
                if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
                    console.info("Product: Firestore permission denied. Using local data (Offline Mode).");
                } else {
                    console.warn("Product Listener Error (Offline Mode):", error);
                }
            }
        );
    } catch (e) {
        console.warn("Product: Init failed or offline, using local storage.");
    }
    return () => unsubscribe();
  }, []);

  const addProduct = async (product: Product) => {
    // Optimistic
    const newProducts = [...products.filter(p => p.maSanPham !== product.maSanPham), product];
    setProducts(newProducts);
    localStorage.setItem(LS_PRODUCTS, JSON.stringify(newProducts));

    try {
        await setDoc(doc(db, "products", product.maSanPham), product);
        showToast('Thêm sản phẩm thành công', 'success');
    } catch (error: any) {
        console.info("Offline add: product (local only)");
        showToast('Đã lưu sản phẩm (Offline mode)', 'info');
    }
  };

  const deleteProduct = async (maSanPham: string) => {
    if(!window.confirm(`Xóa sản phẩm ${maSanPham}?`)) return;
    
    // Optimistic
    const newProducts = products.filter(p => p.maSanPham !== maSanPham);
    setProducts(newProducts);
    localStorage.setItem(LS_PRODUCTS, JSON.stringify(newProducts));

    try {
        await deleteDoc(doc(db, "products", maSanPham));
        showToast('Xóa sản phẩm thành công', 'info');
    } catch (error: any) {
        console.info("Offline delete: product (local only)");
        showToast('Đã xóa sản phẩm (Offline mode)', 'info');
    }
  };

  const deleteAllProducts = async () => {
    if (!window.confirm("CẢNH BÁO: Xóa toàn bộ sản phẩm?")) return;

    // Optimistic
    setProducts([]);
    localStorage.removeItem(LS_PRODUCTS);

    try {
        const q = query(collection(db, "products"));
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        showToast("Đã xóa toàn bộ dữ liệu sản phẩm.", "info");
    } catch (error: any) {
        console.info("Offline delete all: products (local only)");
        showToast("Đã xóa dữ liệu (Offline mode).", "info");
    }
  };

  const importProducts = async (newProducts: Product[]) => {
      // Optimistic merge
      const combined = [...products];
      newProducts.forEach(np => {
          const idx = combined.findIndex(p => p.maSanPham === np.maSanPham);
          if (idx >= 0) combined[idx] = np;
          else combined.push(np);
      });
      setProducts(combined);
      localStorage.setItem(LS_PRODUCTS, JSON.stringify(combined));

      try {
          const batch = writeBatch(db);
          newProducts.forEach((p) => {
              const ref = doc(db, "products", p.maSanPham);
              batch.set(ref, p);
          });
          await batch.commit();
          showToast(`Đã import thành công ${newProducts.length} sản phẩm.`, 'success');
          return true;
      } catch (error: any) {
          console.info("Offline import: products (local only)");
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

"use client";

import { useEffect, useState } from "react";
import { defaultQuery, fetchProducts } from "@/lib/products";
import type {
  Product,
  ProductDraft,
  ProductList,
  SearchQuery,
} from "@/lib/products";
import ProductSearchForm from "./ProductSearchForm";
import ProductForm from "./ProductForm";

type LoadState = "idle" | "loading" | "error" | "ready";

export default function ProductExplorer() {
  const [products, setProducts] = useState<Product[]>([]); //สร้าง State ว่าง
  const [status, setStatus] = useState<LoadState>("idle"); //ค่าเริ่ม
  const [errorMessage, setErrorMessage] = useState("");  // ค่าผิดพลาด
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); //ข้อมูลแก้ไข

  function showResult(list: ProductList) { //เรียกข้อมูล
    setProducts(list.products);
    setStatus("ready");
    console.log(`พบสินค้า ${list.total} รายการ`, list.products);
  }

  function showError(error: unknown) { //เรียกไม่สำเร็จ
    setErrorMessage(
      error instanceof Error ? error.message : "เรียกข้อมูลไม่สำเร็จ"
    );
    setStatus("error");
  }

  async function loadProducts(query: SearchQuery) { //เมื่อต้องการค้นหาสินค้าใหม่
    setStatus("loading");
    setErrorMessage("");

    try {
      showResult(await fetchProducts(query)); //ค่า API
    } catch (error) {
      showError(error);
    }
  }

  useEffect(() => {
    fetchProducts(defaultQuery).then(showResult).catch(showError); //เรียก API ดึงข้อมูลด้วยค่าตั้งต้น
    // เติม: สิ่งที่กำหนดให้ทำงานเพียงครั้งเดียวตอนแสดงผลครั้งแรก
  }, []);

  function saveProduct(draft: ProductDraft) { //บันทึกข้อมูลหรือแก้ไข
    if (editingProduct) {
      setProducts((current) => 
        current.map((item) =>
          item.id === editingProduct.id
            ? {
                ...item,
                ...draft,
                description: item.description,
                images: item.images,
                thumbnail: item.thumbnail,
              }
            : item
        )
      );
      setEditingProduct(null);
      return;
    }

    // บันทึกสินค้าใหม่โดยใช้ id ที่เกิดจากเวลาในปัจจุบัน
    setProducts((current) => [...current, { ...draft, id: Date.now() }]);
  }

  // เริ่มโหมดแก้ไขสินค้าและเติมข้อมูลเดิมลงในฟอร์ม
  function startEditing(product: Product) {
    setEditingProduct(product);
  }

  // ลบสินค้าทั้งหมดในแถวที่เลือกออกจากรายการ
  function removeProduct(id: number) {
    setProducts((current) => current.filter((item) => item.id !== id));

    if (editingProduct?.id === id) {
      setEditingProduct(null);
    }
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Inventory dashboard</p>
          <h1>รายการสินค้า</h1>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={() => loadProducts(defaultQuery)}
          disabled={status === "loading"}
        >
          {status === "loading" ? "กำลังโหลด" : "โหลดข้อมูล"}
        </button>
      </header>

      <section className="panel panel-stack" aria-live="polite">
        {status === "idle" && <div className="status-banner">คลิกปุ่มโหลดข้อมูลเพื่อเริ่ม</div>}

        {status === "loading" && <div className="status-banner">กำลังโหลดข้อมูล</div>}

        {status === "error" && (
          <div className="status-banner error" role="alert">
            {errorMessage}
          </div>
        )}

        {status === "ready" && products.length === 0 && (
          <div className="empty-state">ไม่พบสินค้าที่ตรงกับเงื่อนไข</div>
        )}

        <div className="toolbar-row">
          <div className="left-stack">
            <div className="panel">
              <ProductSearchForm onSearch={loadProducts} />
            </div>

            <div className="panel">
              <ProductForm
                editing={editingProduct}
                onSave={saveProduct}
                onCancel={() => setEditingProduct(null)}
              />
            </div>
          </div>

          {status === "ready" && products.length > 0 && (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>รูป</th>
                    <th>ชื่อสินค้า</th>
                    <th>ราคา</th>
                    <th>คงเหลือ</th>
                    <th>หมวดหมู่</th>
                    <th>การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <img
                          className="product-thumb"
                          src={item.thumbnail ?? item.images?.[0] ?? undefined}
                          alt={item.title}
                          width={64}
                          height={64}
                        />
                      </td>
                      <td className="product-title">{item.title}</td>
                      <td className="price-tag">฿{item.price.toLocaleString()}</td>
                      <td>
                        <span className="stock-pill">{item.stock}</span>
                      </td>
                      <td>
                        <span className="category-badge">{item.category}</span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="table-action edit"
                            type="button"
                            onClick={() => startEditing(item)}
                          >
                            แก้ไข
                          </button>
                          <button
                            className="table-action delete"
                            type="button"
                            onClick={() => removeProduct(item.id)}
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
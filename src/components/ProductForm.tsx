"use client";

import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CATEGORIES, ProductDraftSchema } from "@/lib/products";
import type { Product, ProductDraft } from "@/lib/products";

type ProductFormProps = {
  editing: Product | null;
  onSave: (draft: ProductDraft) => void;
  onCancel: () => void;
};

export default function ProductForm(
  { editing, onSave, onCancel }: ProductFormProps
) {
  // จัดการฟอร์มเพิ่มและแก้ไขสินค้า พร้อมตรวจสอบข้อมูลด้วย Zod
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<ProductDraft>({
    resolver: zodResolver(ProductDraftSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      price: undefined,
      stock: undefined,
    },
  });

  // เติมข้อมูลสินค้าที่เลือกแก้ไข หรือคืนฟอร์มเป็นค่าว่างเมื่อเพิ่มสินค้าใหม่
  useEffect(() => {
    if (editing) {
      reset({
        title: editing.title,
        price: editing.price,
        stock: editing.stock,
        category: editing.category,
      });
      return;
    }

    reset({
      title: "",
      price: undefined,
      stock: undefined,
      category: undefined,
    });
  }, [editing, reset]);

  // ส่งข้อมูลที่ผ่านการตรวจสอบให้ component แม่ แล้วล้างฟอร์ม
  function saveProduct(values: ProductDraft) {
    onSave(values);
    reset({
      title: "",
      price: undefined,
      stock: undefined,
      category: undefined,
    });
  }

  return (
    <form className="product-form" onSubmit={handleSubmit(saveProduct)} noValidate>
      <div className="form-field full-width">
        <label htmlFor="title">ชื่อสินค้า</label>
        <input
          id="title"
          required
          {...register("title")}
          aria-invalid={!!errors.title}
          aria-describedby="title-error"
        />
        <span id="title-error" className="input-error" role="alert">{errors.title?.message}</span>
      </div>

      <div className="form-field">
        <label htmlFor="price">ราคา</label>
        <input
          id="price"
          type="number"
          step="0.01"
          required
          {...register("price", { valueAsNumber: true })}
          aria-invalid={!!errors.price}
          aria-describedby="price-error"
        />
        <span id="price-error" className="input-error" role="alert">{errors.price?.message}</span>
      </div>

      <div className="form-field">
        <label htmlFor="stock">จำนวนคงเหลือ</label>
        <input
          id="stock"
          type="number"
          required
          {...register("stock", { valueAsNumber: true })}
          aria-invalid={!!errors.stock}
          aria-describedby="stock-error"
        />
        <span id="stock-error" className="input-error" role="alert">{errors.stock?.message}</span>
      </div>

      <div className="form-field full-width">
        <label htmlFor="category">หมวดหมู่</label>
        <select
          id="category"
          required
          {...register("category")}
          aria-invalid={!!errors.category}
          aria-describedby="category-error"
        >
          <option value="">กรุณาเลือกหมวดหมู่</option>
          {CATEGORIES.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <span id="category-error" className="input-error" role="alert">
          {errors.category?.message}
        </span>
      </div>

      <div className="button-row full-width">
        <button
          className="primary-button"
          type="submit"
          disabled={!isDirty || !isValid}
        >
          {editing ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}
        </button>

        {editing && (
          <button className="secondary-button" type="button" onClick={onCancel}>
            ยกเลิก
          </button>
        )}
      </div>
    </form>
  );
}

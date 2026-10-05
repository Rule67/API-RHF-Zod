"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  SORT_FIELDS,
  SearchQuerySchema,
  defaultQuery,
} from "@/lib/products";
import type { SearchQuery } from "@/lib/products";



type ProductSearchFormProps = {
  onSearch: (query: SearchQuery) => Promise<void>;
};


export default function ProductSearchForm(
    { onSearch }: ProductSearchFormProps) {
  // จัดการค่าค้นหา ตรวจสอบข้อมูลด้วย Zod และติดตามสถานะการส่งฟอร์ม
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SearchQuery>({
    resolver: zodResolver(SearchQuerySchema),
    mode: "onTouched",
    defaultValues: defaultQuery,
  });

  // ส่งเงื่อนไขค้นหาที่ผ่านการตรวจสอบไปให้ component แม่
  async function submitSearch(values: SearchQuery) {
    await onSearch(values);
  }

  return (
    <form
      className="search-form"
      onSubmit={handleSubmit(submitSearch)}
    >
      <div className="form-field full-width">
        <label htmlFor="q">ค้นหา</label>
        <input id="q" {...register("q")} placeholder="phone" />
      </div>

      <div className="form-field">
        <label htmlFor="limit">จำนวนรายการ</label>
        <input
          id="limit"
          type="number"
          required
          {...register("limit", { valueAsNumber: true })}
          aria-invalid={!!errors.limit}
          aria-describedby="limit-error"
        />
        <span id="limit-error" className="input-error" role="alert">
          {errors.limit?.message}
        </span>
      </div>

      <div className="form-field">
        <label htmlFor="sortBy">เรียงตาม</label>
        <select id="sortBy" {...register("sortBy")}>
          {SORT_FIELDS.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>
      </div>

      <div className="full-width button-row">
        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? "กำลังค้นหา" : "ค้นหา"}
        </button>
      </div>
    </form>
  );
}

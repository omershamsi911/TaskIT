// src/handlers/categories.js
import api from "../api/api";

/**
 * Get all active categories with subcategories
 * GET /categories/
 */
export const fetchCategories = async () => {
  const { data } = await api.get("/categories/");
  console.log("============Categories GET DATA===========")
  console.log(data)
  return data;
};

/**
 * Get single category by slug
 * GET /categories/{slug}
 */
export const fetchCategoryBySlug = async (slug) => {
  const { data } = await api.get(`/categories/${slug}`);
  return data;
};

/**
 * Get subcategories for a category
 * GET /categories/{category_id}/subcategories
 */
export const fetchSubcategories = async (categoryId) => {
  const { data } = await api.get(`/categories/${categoryId}/subcategories`);
  return data;
};
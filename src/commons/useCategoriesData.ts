import { useState, useEffect } from 'react';
import { getVendorsCategories } from '../services/vendors-categories/vendors-categories.service';
import type { GetVendorsCategoriesResponse } from '../services/vendors-categories/types/GetVendorsCategories.type';

export const useCategoriesData = () => {
  const [categories, setCategories] = useState<GetVendorsCategoriesResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await getVendorsCategories();

      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading vendor categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryById = (categoryId: string): GetVendorsCategoriesResponse | null => {
    return categories.find(category => category._id === categoryId) || null;
  };

  const getCategoryName = (categoryId: string): string => {
    const category = getCategoryById(categoryId);
    return category?.name || 'Sin categoría';
  };

  return {
    categories,
    loading,
    getCategoryById,
    getCategoryName,
    refreshCategories: loadCategories
  };
};


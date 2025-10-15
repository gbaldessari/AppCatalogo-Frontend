import { useState, useEffect } from 'react';
import { getTags } from '../services/tags/tags.service';
import type { GetTagsResponse } from '../services/tags/types/GetTags.type';

export interface UseTagsDataReturn {
  tags: GetTagsResponse[];
  loading: boolean;
  error: string | null;
  getTagById: (id: string) => GetTagsResponse | undefined;
  getTagsByIds: (ids: string[]) => GetTagsResponse[];
}

export const useTagsData = (): UseTagsDataReturn => {
  const [tags, setTags] = useState<GetTagsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const token = localStorage.getItem("accessToken") || "";
        const response = await getTags(token);

        if (response.success && response.data) {
          setTags(response.data);
          setError(null);
        } else {
          setError(response.error || 'Error al cargar etiquetas');
        }
      } catch (err) {
        setError('Error de conexión al cargar etiquetas');
      } finally {
        setLoading(false);
      }
    };

    loadTags();
  }, []);

  const getTagById = (id: string): GetTagsResponse | undefined => {
    return tags.find(tag => tag._id === id);
  };

  const getTagsByIds = (ids: string[]): GetTagsResponse[] => {
    return ids.map(id => getTagById(id)).filter(Boolean) as GetTagsResponse[];
  };

  return {
    tags,
    loading,
    error,
    getTagById,
    getTagsByIds
  };
};

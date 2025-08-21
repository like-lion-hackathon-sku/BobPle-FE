import { apiFetch } from '@/shared/api/client';

export type Restaurant = {
  id: number;
  name: string;
  category: 'KOREAN'|'JAPANESE'|'CHINESE';
  address: string;
  telephone?: string | null;
  mapx?: number | null;
  mapy?: number | null;
  is_sponsored?: boolean | null;
};

export const getRestaurants = () => apiFetch<Restaurant[]>('/api/restaurants');
export const getRestaurant = (id: number) => apiFetch<Restaurant>(`/api/restaurants/${id}`);
export const getRestaurantRecommends = () => apiFetch<Restaurant[]>('/api/restaurants/recommends');

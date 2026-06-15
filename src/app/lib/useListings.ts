'use client';
import { useState, useEffect, useCallback } from 'react';
import { NormalizedSkin } from './csfloat';

export interface ListingsParams {
  limit?: number;
  type?: 'buy_now' | 'auction';
  market_hash_name?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
  rarity?: number;
  category?: number;
}

export function useListings(params: ListingsParams = {}) {
  const [data, setData] = useState<NormalizedSkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (params.limit)           qs.set('limit', String(params.limit));
      if (params.type)            qs.set('type', params.type);
      if (params.market_hash_name) qs.set('market_hash_name', params.market_hash_name);
      if (params.min_price)       qs.set('min_price', String(params.min_price));
      if (params.max_price)       qs.set('max_price', String(params.max_price));
      if (params.sort_by)         qs.set('sort_by', params.sort_by);
      if (params.rarity)          qs.set('rarity', String(params.rarity));
      if (params.category)        qs.set('category', String(params.category));

      const res = await fetch(`/api/listings?${qs}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch');
      setData(json.data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetch_(); }, [fetch_]);

  return { data, loading, error, refetch: fetch_ };
}

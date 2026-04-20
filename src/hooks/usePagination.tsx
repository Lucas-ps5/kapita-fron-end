import { useState, useMemo } from 'react';

const ITEMS_PER_PAGE = 10;

export function usePagination<T>(items: T[], perPage = ITEMS_PER_PAGE) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const safeePage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safeePage - 1) * perPage;
    return items.slice(start, start + perPage);
  }, [items, safeePage, perPage]);

  const goToPage = (p: number) => setPage(Math.max(1, Math.min(p, totalPages)));
  const nextPage = () => goToPage(safeePage + 1);
  const prevPage = () => goToPage(safeePage - 1);

  return {
    items: paginatedItems,
    page: safeePage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    hasNext: safeePage < totalPages,
    hasPrev: safeePage > 1,
    total: items.length,
  };
}

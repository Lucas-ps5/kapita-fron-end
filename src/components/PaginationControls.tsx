import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage: () => void;
  prevPage: () => void;
  total: number;
}

export default function PaginationControls({
  page, totalPages, hasNext, hasPrev, nextPage, prevPage, total,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between py-3">
      <Button variant="outline" size="sm" disabled={!hasPrev} onClick={prevPage} className="gap-1">
        <ChevronLeft className="h-4 w-4" /> Préc.
      </Button>
      <span className="text-xs text-muted-foreground">
        Page {page}/{totalPages} · {total} éléments
      </span>
      <Button variant="outline" size="sm" disabled={!hasNext} onClick={nextPage} className="gap-1">
        Suiv. <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

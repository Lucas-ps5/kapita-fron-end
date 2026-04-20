export function formatCFA(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString('fr-FR');
  return `${amount < 0 ? '-' : ''}${formatted} FCFA`;
}

export function formatAmount(amount: number): string {
  return Math.abs(amount).toLocaleString('fr-FR');
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

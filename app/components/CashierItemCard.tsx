type CashierItemCardProps = {
  item: {
    id: number;
    name: string;
    price: number;
  };
  onSelect: () => void;
};

export default function CashierItemCard({
  item,
  onSelect,
}: CashierItemCardProps) {
  return (
    <button
      onClick={onSelect}
      className="w-full rounded-lg border bg-white p-3 text-left shadow-sm transition hover:bg-gray-100"
    >
      <p className="text-sm font-semibold text-(--gray)">{item.name}</p>
      <p className="mt-1 text-xs text-(--gray)">${item.price.toFixed(2)}</p>
    </button>
  );
}

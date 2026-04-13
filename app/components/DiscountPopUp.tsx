"use client";

type Discount = {
  id: number;
  type: string;
  amount: number;
};

type DiscountModalProps = {
  isOpen: boolean;
  discounts: Discount[];
  onClose: () => void;
  onSelect: (discount: Discount) => void;
};

export default function DiscountPopUp({
  isOpen,
  discounts,
  onClose,
  onSelect,
}: DiscountModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-500">Select Discount</h2>
        </div>

        {/* Discount Options */}
        <div className="space-y-3">
          {discounts.length > 0 ? (
            discounts.map((discount) => (
              <button
                key={discount.id}
                onClick={() => onSelect(discount)}
                className="w-full border rounded p-3 text-left hover:bg-gray-100 transition"
              >
                <p className="font-semibold text-gray-500">{discount.type}</p>
                <p className="text-sm text-gray-600">
                  -${discount.amount.toFixed(2)}
                </p>
              </button>
            ))
          ) : (
            <p className="text-gray-500 text-center">No discounts available</p>
          )}
        </div>

        {/* Cancel Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="border rounded px-4 py-2 hover:bg-gray-100 text-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
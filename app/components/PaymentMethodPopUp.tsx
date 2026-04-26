"use client";

type PaymentMethodPopUpProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (method: string) => void;
};

export default function PaymentMethodPopUp({
  isOpen,
  onClose,
  onSelect,
}: PaymentMethodPopUpProps) {
  if (!isOpen) return null;

  const paymentMethods = ["Cash", "Card", "Check"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-(--gray)">
            Select Payment Method
          </h2>
        </div>

        {/* Payment Options */}
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <button
              key={method}
              onClick={() => onSelect(method)}
              className="w-full border rounded p-3 text-left hover:bg-gray-100 transition text-(--gray)"
            >
              {method}
            </button>
          ))}
        </div>

        {/* Cancel */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="border rounded px-4 py-2 hover:bg-gray-100 text-(--gray)"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

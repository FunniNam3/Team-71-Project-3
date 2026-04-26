"use client";

type RemoveItemPopUpProps = {
  isOpen: boolean;
  itemName: string;
  itemType: "drink" | "food" | "";
  onClose: () => void;
  onRemove: () => void;
};

export default function RemoveItemPopUp({
  isOpen,
  itemName,
  itemType,
  onClose,
  onRemove,
}: RemoveItemPopUpProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-3 text-xl font-bold text-gray-700">
          Remove {itemType}
        </h2>

        <p className="text-gray-600">
          Are you sure you want to remove{" "}
          <span className="font-semibold text-gray-800">{itemName}</span>?
        </p>

        <p className="mt-2 text-sm text-red-600">
          This action is permanent and cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded border px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={onRemove}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
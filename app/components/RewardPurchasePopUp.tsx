"use client";

type Reward = {
  id: number;
  item: string;
  points: number;
  type: string;
  image: string;
};

type RewardPurchasePopUpProps = {
  isOpen: boolean;
  reward: Reward | null;
  userPoints: number;
  onClose: () => void;
  onConfirm: (reward: Reward) => Promise<void> | void;
};

export default function RewardPurchasePopUp({
  isOpen,
  reward,
  userPoints,
  onClose,
  onConfirm,
}: RewardPurchasePopUpProps) {
  if (!isOpen || !reward) return null;

  const hasEnoughPoints = userPoints >= reward.points;

  async function handleConfirm() {
    if (!hasEnoughPoints || !reward) return;
    await onConfirm(reward);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Redeem Reward</h2>
          <button
            onClick={onClose}
            className="rounded border px-3 py-1 hover:bg-gray-100"
          >
            X
          </button>
        </div>

        {hasEnoughPoints ? (
          <>
            <p className="text-gray-700">
              Are you sure you want to purchase a{" "}
              <span className="font-semibold">{reward.item}</span> for{" "}
              <span className="font-semibold">{reward.points}</span> points?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded border px-4 py-2 hover:bg-gray-100"
              >
                No
              </button>

              <button
                onClick={handleConfirm}
                className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Yes
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-700">
              You do not have enough points yet to redeem{" "}
              <span className="font-semibold">{reward.item}</span>.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              You have {userPoints} points, but this reward costs {reward.points} points.
            </p>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Okay
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
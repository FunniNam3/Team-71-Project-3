"use client";

type Reward = {
  id: number;
  item: string;
  points: number;
  type: string;
  image: string;
};

type RewardCardProps = {
  reward: Reward;
  onSelect?: (reward: Reward) => void; // optional (for future click actions)
};

export default function RewardCard({ reward, onSelect }: RewardCardProps) {
  return (
    <div
      onClick={() => onSelect?.(reward)}
      className="cursor-pointer rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md"
    >
      {/* Image */}
      <div className="mb-2 flex h-24 w-full items-center justify-center overflow-hidden rounded-md bg-gray-100">
        {reward.image ? (
          <img
            src={reward.image}
            alt={reward.item}
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="text-sm text-(--gray)">No Image</span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-(--gray) line-clamp-2">
        {reward.item}
      </h3>

      {/* Points */}
      <p className="mt-1 text-sm font-medium text-green-600">
        {reward.points} pts
      </p>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import RewardCard from "@components/RewardCard";
import RewardPurchasePopUp from "@components/RewardPurchasePopUp";

type Reward = {
  id: number;
  item: string;
  points: number;
  type: string;
  image: string;
};

type LoginUser = {
  id: number;
  auth0_user_id: string;
  name: string;
  role: string;
  points: number;
  cart: string | null;
};

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showRewardPopup, setShowRewardPopup] = useState(false);

  useEffect(() => {
    async function loadRewardsPage() {
      try {
        setLoading(true);

        const [rewardsRes, loginRes] = await Promise.all([
          fetch("/api/rewards"),
          fetch("/api/login"),
        ]);

        const rewardsJson = await rewardsRes.json();
        const loginJson = await loginRes.json();

        if (rewardsRes.ok && Array.isArray(rewardsJson.data)) {
          setRewards(rewardsJson.data);
        } else {
          console.error("Failed to load rewards:", rewardsJson);
          setRewards([]);
        }

        if (loginRes.ok) {
          if (loginJson.data?.points != null) {
            setUserPoints(loginJson.data.points);
          } else if (loginJson.points != null) {
            setUserPoints(loginJson.points);
          } else {
            console.error("Login route did not return points:", loginJson);
            setUserPoints(0);
          }
        } else {
          console.error("Failed to load user points:", loginJson);
          setUserPoints(0);
        }
      } catch (error) {
        console.error("Failed to load rewards page:", error);
        setRewards([]);
        setUserPoints(0);
      } finally {
        setLoading(false);
      }
    }

    loadRewardsPage();
  }, []);

  const giftRewards = useMemo(() => {
    return rewards.filter(
      (reward) => reward.type?.trim().toLowerCase() === "gifts"
    );
  }, [rewards]);

  const drinkRewards = useMemo(() => {
    return rewards.filter(
      (reward) => reward.type?.trim().toLowerCase() === "drinks"
    );
  }, [rewards]);

  const toyRewards = useMemo(() => {
    return rewards.filter(
      (reward) => reward.type?.trim().toLowerCase() === "toys"
    );
  }, [rewards]);

  function handleSelectReward(reward: Reward) {
    setSelectedReward(reward);
    setShowRewardPopup(true);
  }

  async function handleConfirmReward(reward: Reward) {
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rewardId: reward.id }),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.error || "Failed to redeem reward.");
        return;
      }

      if (json.data?.user?.points != null) {
        setUserPoints(json.data.user.points);
      }

      setShowRewardPopup(false);
      setSelectedReward(null);

      alert("Go to cashier for prize.");
    } catch (error) {
      console.error("Failed to redeem reward:", error);
      alert("Failed to redeem reward.");
    }
  }

  if (loading) {
    return (
      <div className="mt-20 text-center text-gray-500">Loading rewards...</div>
    );
  }

  return (
    <main className="min-h-screen bg-[#d7c5b1] p-6">
      <div className="mx-auto flex max-w-7xl gap-6">
        {/* Left Side */}
        <section className="w-full max-w-70 rounded-2xl bg-[#f5f5f5] p-6 shadow-sm">
          <h1 className="mb-2 text-3xl font-bold text-[#2f4d73]">Rewards</h1>
          <p className="mb-8 text-sm text-gray-600">
            Redeem your points for gifts, drinks, and toys.
          </p>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#5e6f88]">Your Points</p>
            <p className="mt-2 text-4xl font-bold text-[#00a67e]">
              {userPoints}
            </p>
            <p className="mt-3 text-sm text-gray-500">
              Earn points through purchases and use them for rewards.
            </p>
          </div>
        </section>

        {/* Right Side */}
        <section className="flex-1 space-y-6">
          <RewardSection
            title="Gifts"
            rewards={giftRewards}
            onSelect={handleSelectReward}
          />

          <RewardSection
            title="Drinks"
            rewards={drinkRewards}
            onSelect={handleSelectReward}
          />

          <RewardSection
            title="Toys"
            rewards={toyRewards}
            onSelect={handleSelectReward}
          />
        </section>
      </div>

      <RewardPurchasePopUp
        isOpen={showRewardPopup}
        reward={selectedReward}
        userPoints={userPoints}
        onClose={() => {
          setShowRewardPopup(false);
          setSelectedReward(null);
        }}
        onConfirm={handleConfirmReward}
      />
    </main>
  );
}

type RewardSectionProps = {
  title: string;
  rewards: Reward[];
  onSelect: (reward: Reward) => void;
};

function RewardSection({ title, rewards, onSelect }: RewardSectionProps) {
  return (
    <div className="rounded-2xl bg-[#f5f5f5] p-5 shadow-sm">
      <h2 className="mb-4 text-2xl font-bold text-[#2f4d73]">{title}</h2>

      {rewards.length === 0 ? (
        <p className="text-sm text-gray-500">No rewards found in this section.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {rewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
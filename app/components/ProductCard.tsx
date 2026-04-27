"use client";
import Image from "next/image";
import Modal from "@components/Modal";
import { useState } from "react";

interface ProductCardProps {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  onAddToCart: (item: any) => void;
  onCustomize: () => void; // Add this prop to handle the save
}

export default function ProductCard({
  name,
  description,
  price,
  imageUrl,
  onAddToCart,
  onCustomize,
}: ProductCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => {
          onCustomize();
          setIsOpen(true);
        }}
        className="bg-white p-4 rounded-2xl border-2 border-[#00A67E] hover:shadow-lg transition-all gap-4 flex flex-col text-left"
      >
        <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-gray-100">
          <Image src={imageUrl} alt={name} fill className="object-cover" />
        </div>

        <h3 className="text-(--gray) text-2xl font-semibold mb-1">{name}</h3>
        <p className="text-(--gray) text-sm grow mb-4">{description}</p>

        <div className="flex justify-between items-center mt-auto">
          <span className="text-(--gray) text-xl font-bold">
            ${price.toFixed(2)}
          </span>
          <div className="bg-[#00A67E] text-white rounded-full p-2 hover:scale-105 active:scale-95 transition-all shadow-md">
            <Image src="/plus-icon.svg" alt="Add" width={24} height={24} />
          </div>
        </div>
      </button>
    </>
  );
}

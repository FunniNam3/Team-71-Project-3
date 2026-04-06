// src/components/ProductCard.tsx
import Image from "next/image";

interface ProductCardProps {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  onCustomize: () => void; // Function to call when '+' is clicked
}

export default function ProductCard({
  name,
  description,
  price,
  imageUrl,
  onCustomize,
}: ProductCardProps) {
  /*
    FIXME
    Product cards are the wrong size
    Image sizes should be uniform
    Missing item descriptions

  */
  return (
    <button
      onClick={onCustomize}
      className="bg-white p-4 rounded-2xl border-2 border-[#00A67E]"
    >
      {/* Product Image */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-(--secondary)">
        <Image src={imageUrl} alt={name} fill className="object-cover" />
      </div>

      {/* Text Info */}
      <h3 className="text-(--dark) text-2xl font-semibold mb-1">{name}</h3>
      <p className="text-gray-600 text-sm grow mb-4 truncate">{description}</p>

      {/* Price and Add Button */}
      <div className="flex justify-between items-center mt-auto">
        <span className="text-(--dark) text-xl font-bold">
          ${price.toFixed(2)}
        </span>
        <button
          onClick={onCustomize}
          className="bg-[#00A67E] text-white rounded-full p-2 hover:scale-105 active:scale-95 transition-all shadow-md"
        >
          <Image src="/plus-icon.svg" alt="Add" width={24} height={24} />
        </button>
      </div>
    </button>
  );
}

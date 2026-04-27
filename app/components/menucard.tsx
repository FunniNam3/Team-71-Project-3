// src/components/ProductCard.tsx
import Image from "next/image";

interface MenuCardProps {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export default function MenuCard({
  name,
  description,
  price,
  imageUrl,
}: MenuCardProps) {
  return (
    <div className="bg-#C4AF9A p-4 rounded-2xl transition-all">
      {/* Product Image */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-(--secondary)">
        <Image src={imageUrl} alt={name} fill className="object-cover" />
      </div>

      {/* Text Info */}
      <h3 className="text-(--dark) text-2xl font-semibold mb-1">{name}</h3>
      <p className="text-(--gray) text-sm grow mb-4 truncate">{description}</p>

      {/* Price and Add Button */}
      <div className="flex justify-between items-center mt-auto">
        <span className="text-(--dark) text-xl font-bold">
          ${price.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

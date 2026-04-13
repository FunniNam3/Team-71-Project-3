import { createPortal } from "react-dom";
import { Dispatch, SetStateAction } from "react"; // Add this import

// Ensure this matches the 'MenuItem' interface in your OrderPage exactly
export interface CartItem {
  instanceId: string;
  name: string;
  price: number;
  imageUrl: string; // Added this to match your fetch data
  customizations: {
    ice: string;
    sugar: string;
    toppings: string[];
  };
}

interface CartModalProps {
  cart: CartItem[];
  onClose: () => void;
  // This is the "official" type for a React setState function
  setCart: Dispatch<SetStateAction<any[]>>; 
}

export default function CartModal({ cart, onClose, setCart }: CartModalProps) {
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.instanceId !== id));
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
       {/* ... the rest of your JSX remains the same ... */}
    </div>,
    document.body
  );
}
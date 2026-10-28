import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, RescueBag } from '../types';
import { DEMO_BAGS } from '../data/mockData';

interface CartContextType {
  cartItem: CartItem | null;
  addToCart: (bag: RescueBag, quantity?: number) => void;
  updateQuantity: (quantity: number) => void;
  removeFromCart: () => void;
  clearCart: () => void;
  secondsRemaining: number;
  formatTimer: () => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Initial demo item: Start with the End-of-Day Pizza Box loaded as in the Stitch design preview
const DEFAULT_INITIAL_ITEM: CartItem = {
  bag: DEMO_BAGS[0],
  quantity: 1,
  reservedAt: Date.now(),
  expiresAt: Date.now() + (13 * 60 + 42) * 1000,
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItem, setCartItem] = useState<CartItem | null>(() => {
    const saved = localStorage.getItem('lefto_cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.bag && parsed.quantity > 0) {
          return parsed;
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [secondsRemaining, setSecondsRemaining] = useState<number>(13 * 60 + 42);

  useEffect(() => {
    if (!cartItem) {
      setSecondsRemaining(0);
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cartItem]);

  useEffect(() => {
    if (cartItem) {
      localStorage.setItem('lefto_cart', JSON.stringify(cartItem));
    } else {
      localStorage.removeItem('lefto_cart');
    }
  }, [cartItem]);

  const addToCart = (bag: RescueBag, quantity = 1) => {
    const newItem: CartItem = {
      bag,
      quantity,
      reservedAt: Date.now(),
      expiresAt: Date.now() + 15 * 60 * 1000,
    };
    setCartItem(newItem);
    setSecondsRemaining(15 * 60);
  };

  const updateQuantity = (quantity: number) => {
    if (!cartItem) return;
    if (quantity <= 0) {
      removeFromCart();
      return;
    }
    const maxAllowed = Math.min(cartItem.bag.stockLeft || 5, 5);
    const clampedQty = Math.min(Math.max(quantity, 1), maxAllowed);
    setCartItem({ ...cartItem, quantity: clampedQty });
  };

  const removeFromCart = () => {
    setCartItem(null);
    setSecondsRemaining(0);
  };

  const clearCart = () => {
    setCartItem(null);
    setSecondsRemaining(0);
  };

  const formatTimer = () => {
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <CartContext.Provider
      value={{
        cartItem,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        secondsRemaining,
        formatTimer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

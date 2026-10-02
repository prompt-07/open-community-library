import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

// Per-session reservation limit (matches server MAX_RESERVATIONS_PER_SESSION).
export const MAX_CART = 3;

export function CartProvider({ children }) {
  // Cart holds { _id, title, author } entries, persisted client-side only.
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ol_cart') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ol_cart', JSON.stringify(items));
  }, [items]);

  function add(book) {
    setItems((cur) => {
      if (cur.some((b) => b._id === book._id)) return cur; // no duplicates
      if (cur.length >= MAX_CART) return cur; // enforce limit client-side
      return [...cur, { _id: book._id, title: book.title, author: book.author }];
    });
  }

  function remove(bookId) {
    setItems((cur) => cur.filter((b) => b._id !== bookId));
  }

  function clear() {
    setItems([]);
  }

  const has = (bookId) => items.some((b) => b._id === bookId);
  const isFull = items.length >= MAX_CART;

  return (
    <CartContext.Provider value={{ items, add, remove, clear, has, isFull, MAX_CART }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

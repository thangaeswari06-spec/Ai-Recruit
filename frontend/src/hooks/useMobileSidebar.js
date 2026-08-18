// Tiny shared toggle so the Topbar hamburger (mobile) and the Sidebar
// (which are siblings, not parent/child) can control the same
// open/closed state without wrapping the whole app in a new Context.
import { useEffect, useState } from "react";
 
let isOpen = false;
const listeners = new Set();
 
function setOpen(next) {
  isOpen = typeof next === "function" ? next(isOpen) : next;
  listeners.forEach((listener) => listener(isOpen));
}
 
export function useMobileSidebar() {
  const [open, setLocalOpen] = useState(isOpen);
 
  useEffect(() => {
    listeners.add(setLocalOpen);
    return () => listeners.delete(setLocalOpen);
  }, []);
 
  return {
    open,
    toggle: () => setOpen((v) => !v),
    close: () => setOpen(false),
  };
}
 
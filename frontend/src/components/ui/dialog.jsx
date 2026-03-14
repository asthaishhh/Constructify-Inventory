import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Dialog({ open, onClose, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay background */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Dialog content wrapper */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-lg mx-4 p-6 relative z-[51]"
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function DialogHeader({ children }) {
  return <div className="mb-4 border-b pb-2">{children}</div>;
}

export function DialogTitle({ children }) {
  return <h2 className="text-xl font-semibold">{children}</h2>;
}

export function DialogContent({ children }) {
  return <div className="mt-2 space-y-4">{children}</div>;
}
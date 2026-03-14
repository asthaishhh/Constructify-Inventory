import React from "react";

export function Select({ value, onValueChange, children, className = "" }) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={`border border-gray-300 rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500 ${className}`}
    >
      {children}
    </select>
  );
}

export function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>;
}


// export default function Select({ children, value, onValueChange }) {
//   return (
//     <select
//       value={value}
//       onChange={(e) => onValueChange(e.target.value)}
//       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
//     >
//       {children}
//     </select>
//   );
// }

// function SelectItem({ value, children }) {
//   return <option value={value}>{children}</option>;
// }


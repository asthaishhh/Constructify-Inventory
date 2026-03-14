import React from "react";

export function Input({ type = "text", value, onChange, placeholder, className = "", name, ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      name={name}
      className={`border border-gray-300 rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500 ${className}`}
      {...props}
    />
  );
}

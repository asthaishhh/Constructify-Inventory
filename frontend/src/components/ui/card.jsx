// import React from "react";

// export const Card = ({ children, className = "" }) => (
//   <div
//     className={`bg-white shadow-lg rounded-2xl border border-gray-100 ${className}`}
//   >
//     {children}
//   </div>
// );

// export const CardHeader = ({ children, className = "" }) => (
//   <div className={`p-4 border-b border-gray-100 flex justify-between items-center ${className}`}>
//     {children}
//   </div>
// );

// export const CardTitle = ({ children, className = "" }) => (
//   <h2 className={`text-xl font-semibold text-gray-700 ${className}`}>{children}</h2>
// );

// export const CardContent = ({ children, className = "" }) => (
//   <div className={`p-4 ${className}`}>{children}</div>
// );


import React from "react";

export function Card({ children, className = "" }) {
  return <div className={`rounded-2xl shadow-md bg-white p-4 ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = "" }) {
  return <div className={`border-b pb-2 mb-2 flex justify-between items-center ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }) {
  return <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>;
}

export function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

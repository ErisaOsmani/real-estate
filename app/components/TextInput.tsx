"use client"

import React from "react"

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export default function TextInput({ label, ...props }: TextInputProps) {
  const className =
    "w-full border border-white/20 rounded-lg p-3 mb-4 text-white bg-white/10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"

  return (
    <div>
      {label && (
        <label className="block text-sm text-gray-300 mb-1">{label}</label>
      )}
      <input {...props} className={className} />
    </div>
  )
}

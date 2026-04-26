"use client"

import React from "react"

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
}

export default function TextInput({ label, hint, className = "", ...props }: TextInputProps) {
  const inputClassName = [
    "w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white",
    "placeholder:text-white/30 focus:border-amber-200/35 focus:outline-none",
    "focus:bg-white/[0.08] transition",
    className,
  ].join(" ")

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-medium uppercase tracking-[0.24em] text-white/55">
          {label}
        </label>
      )}
      <input {...props} className={inputClassName} />
      {hint && (
        <p className="text-xs text-white/40">
          {hint}
        </p>
      )}
    </div>
  )
}

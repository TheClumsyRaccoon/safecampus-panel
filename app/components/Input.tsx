import { ComponentProps } from "react";

interface InputProps extends ComponentProps<"input"> {
  label: string;
  id: string;
}

export default function Input({ label, id, type = "text", ...props }: InputProps) {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-textsecondary"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-textmain transition-colors focus:border-primary focus:bg-white focus:outline-none"
        {...props}
      />
    </div>
  );
}
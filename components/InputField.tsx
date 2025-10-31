interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

export default function InputField({
  id,
  label,
  value,
  placeholder,
  onChange,
}: InputFieldProps) {
  return (
    <label className="flex flex-col text-lg text-[#FFD366]">
      <span>{label}</span>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode="decimal"
        type="number"
        min="0"
        className="mt-2 h-10 w-full rounded-[15px] border-2 border-[#FFD366] bg-[rgba(39,39,39,0.75)] px-4 text-xl text-white outline-none transition focus:border-white"
      />
    </label>
  );
}

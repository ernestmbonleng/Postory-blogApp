type FormInputProps = {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void; 
};

export function FormInput({ label, type = 'text', value, onChange }: FormInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}  
        className="rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
      />
    </div>
  );
}

import type { AdminTechnology } from "../../../types/admin";
import { fieldErrorClass, labelClass } from "./styles";

type TechnologiesPickerProps = {
  options: AdminTechnology[];
  selected: string[];
  error?: string;
  label?: string;
  onChange: (ids: string[]) => void;
};

const TechnologiesPicker = ({
  options,
  selected,
  error,
  label = "Technologies",
  onChange,
}: TechnologiesPickerProps) => {
  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((item) => item !== id)
        : [...selected, id]
    );
  };

  return (
    <div>
      <span className={labelClass}>{label}</span>

      {options.length === 0 ? (
        <p className="text-sm text-secondary">
          Belum ada teknologi terdaftar.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((tech) => {
            const active = selected.includes(tech.id);
            return (
              <button
                key={tech.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(tech.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  active
                    ? "border border-acid/50 bg-acid/15 text-acid"
                    : "border border-white/10 bg-white/[0.04] text-secondary hover:border-white/25 hover:text-white"
                }`}
              >
                {tech.name}
              </button>
            );
          })}
        </div>
      )}

      {error && <p className={fieldErrorClass}>{error}</p>}
    </div>
  );
};

export default TechnologiesPicker;

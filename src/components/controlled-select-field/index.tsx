import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';

import { SelectField, type SelectOption } from '@/components/select-field';

type ControlledSelectFieldProps<T extends FieldValues> = {
  // Accept a control regardless of its context / transformed-output types -
  // the wrapper only binds input-side fields, so forms whose zodResolver
  // transforms the output to a different shape still work here.
  control: Control<T, unknown, FieldValues>;
  name: Path<T>;
  label: string;
  placeholder: string;
  options: SelectOption[];
  multiple?: boolean;
};

/**
 * `SelectField` bound to a react-hook-form field. The value casts are safe: the
 * form schema fixes each field to `string` (single) or `string[]` (multiple),
 * but this generic wrapper can't statically connect `name` to that shape.
 */
export function ControlledSelectField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
  multiple = false,
}: ControlledSelectFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) =>
        multiple ? (
          <SelectField
            label={label}
            placeholder={placeholder}
            options={options}
            multiple
            value={(field.value ?? []) as string[]}
            onChange={field.onChange}
          />
        ) : (
          <SelectField
            label={label}
            placeholder={placeholder}
            options={options}
            value={(field.value ?? '') as string}
            onChange={field.onChange}
          />
        )
      }
    />
  );
}

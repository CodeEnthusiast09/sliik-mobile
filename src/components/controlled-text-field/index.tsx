import { type ComponentProps } from 'react';
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';

import { TextField } from '@/components/text-field';

type ControlledTextFieldProps<T extends FieldValues> = Omit<
  ComponentProps<typeof TextField>,
  'value' | 'onChangeText' | 'onBlur' | 'error'
> & {
  // Accept a control regardless of its context / transformed-output types -
  // the wrapper only binds input-side fields, so forms whose zodResolver
  // transforms the output to a different shape still work here.
  control: Control<T, unknown, FieldValues>;
  name: Path<T>;
};

/** `TextField` bound to a react-hook-form field. Turns red when the field has an error. */
export function ControlledTextField<T extends FieldValues>({
  control,
  name,
  ...rest
}: ControlledTextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          {...rest}
          value={field.value == null ? '' : String(field.value)}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          error={!!fieldState.error}
        />
      )}
    />
  );
}

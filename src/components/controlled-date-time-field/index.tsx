import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';

import {
  DateTimeField,
  type DateTimeFieldProps,
} from '@/components/date-time-field';

type ControlledDateTimeFieldProps<T extends FieldValues> = Omit<
  DateTimeFieldProps,
  'value' | 'onChangeValue'
> & {
  // Accept a control regardless of its context / transformed-output types -
  // the wrapper only binds input-side fields, so forms whose zodResolver
  // transforms the output to a different shape still work here.
  control: Control<T, unknown, FieldValues>;
  name: Path<T>;
};

/** `DateTimeField` bound to a react-hook-form field (stores an ISO string). */
export function ControlledDateTimeField<T extends FieldValues>({
  control,
  name,
  ...rest
}: ControlledDateTimeFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <DateTimeField
          {...rest}
          value={field.value == null ? '' : String(field.value)}
          onChangeValue={field.onChange}
        />
      )}
    />
  );
}

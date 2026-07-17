import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { TextInput, type TextInputProps } from 'react-native';

type ControlledTextInputProps<T extends FieldValues> = Omit<
  TextInputProps,
  'value' | 'onChangeText' | 'onBlur'
> & {
  // Accept a control regardless of its context / transformed-output types -
  // the wrapper only binds input-side fields, so forms whose zodResolver
  // transforms the output to a different shape still work here.
  control: Control<T, unknown, FieldValues>;
  name: Path<T>;
};

/**
 * Raw `TextInput` bound to a react-hook-form field, for the forms that style
 * their inputs inline (via `className`) rather than using the `TextField` component.
 * Always stores the raw string; numeric fields rely on a `z.coerce.number()` schema
 * so decimals stay typeable during editing and only convert to a number at submit.
 */
export function ControlledTextInput<T extends FieldValues>({
  control,
  name,
  ...rest
}: ControlledTextInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <TextInput
          {...rest}
          value={field.value == null ? '' : String(field.value)}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
        />
      )}
    />
  );
}

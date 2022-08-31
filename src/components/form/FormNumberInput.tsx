import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react'
import { useField } from '@unform/core'
import { useEffect, useRef } from 'react'
import NumberInput, { NumberInputProps, NumberInputRef } from '../NumberInput'

interface FormNumberInputProps extends NumberInputProps {
  name: string
  label?: string
}

const FormNumberInput = ({
  name,
  isRequired,
  label,
  ...rest
}: FormNumberInputProps) => {
  const ref = useRef<NumberInputRef>(null)
  const { fieldName, registerField, defaultValue, error, clearError } =
    useField(name)

  useEffect(() => {
    registerField({
      name: fieldName,
      getValue: () => ref.current?.getValue(),
      clearValue: () => ref.current?.setValue(),
      setValue: (_, value) => ref.current?.setValue(Number(value))
    })
  }, [fieldName, registerField])

  return (
    <FormControl
      variant="floating"
      isRequired={isRequired}
      isInvalid={Boolean(error)}>
      <NumberInput
        {...rest}
        placeholder=" "
        onFocus={clearError}
        ref={ref}
        defaultValue={defaultValue}
      />
      {label && <FormLabel>{label}</FormLabel>}

      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  )
}

export default FormNumberInput

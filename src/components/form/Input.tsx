import { useEffect, useRef } from 'react'
import { useField } from '@unform/core'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input as ChakraInput,
  InputProps as ChakraInputProps
} from '@chakra-ui/react'

interface Props {
  name: string
  label?: string
}

type InputProps = Props & ChakraInputProps

const Input = ({ name, label, isRequired, ...rest }: InputProps) => {
  const inputRef = useRef(null)
  const { fieldName, defaultValue, registerField, error, clearError } =
    useField(name)

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: 'value'
    })
  }, [fieldName, registerField])

  return (
    <FormControl
      variant="floating"
      isRequired={isRequired}
      isInvalid={Boolean(error)}>
      <ChakraInput
        onFocus={clearError}
        ref={inputRef}
        defaultValue={defaultValue}
        {...rest}
        placeholder=" "
      />
      {label && <FormLabel>{label}</FormLabel>}

      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  )
}

export default Input

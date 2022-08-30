import { Input, InputProps } from '@chakra-ui/react'
import {
  FocusEventHandler,
  forwardRef,
  ForwardRefRenderFunction,
  KeyboardEventHandler,
  useImperativeHandle,
  useRef,
  useState
} from 'react'
import NumberFormat from 'react-number-format'

interface CustomInputProps {
  props: InputProps
  onKeyDown?: KeyboardEventHandler
  onFocus?: FocusEventHandler
}

const CustomInputWithRef: ForwardRefRenderFunction<
  HTMLInputElement,
  CustomInputProps
> = (
  {
    props: { onKeyDown = () => {}, onFocus = () => {}, ...props },
    ...customProps
  },
  ref
) => (
  <Input
    ref={ref}
    {...props}
    {...customProps}
    onFocus={(e) => {
      customProps.onFocus?.(e)
      onFocus(e)
    }}
    onKeyDown={(e) => {
      customProps.onKeyDown?.(e)
      onKeyDown(e)
    }}
  />
)

const CustomInput = forwardRef(CustomInputWithRef)

export interface NumberInputRef {
  setValue: (value?: number) => void
  focus: () => void
  select: () => void
  getValue: () => string | undefined
}

interface NumberInputProps extends InputProps {
  precision?: number
  defaultValue?: number
  onValueChange?: (value?: number) => void
}

const NumberInputWithRef: ForwardRefRenderFunction<
  NumberInputRef,
  NumberInputProps
> = (
  { precision = 2, defaultValue, prefix, onValueChange = () => {}, ...props },
  ref
) => {
  const [value, setValue] = useState<number | string>(defaultValue || '')
  const inputRef = useRef<HTMLInputElement>()

  useImperativeHandle(
    ref,
    () => ({
      setValue: (newValue) => setValue(newValue || ''),
      focus: () => inputRef.current?.focus(),
      select: () => inputRef.current?.select(),
      getValue: () => inputRef.current?.value
    }),
    []
  )

  return (
    <NumberFormat
      value={value}
      getInputRef={inputRef}
      onValueChange={(values) => {
        setValue(values.floatValue || '')
        onValueChange(values.floatValue)
      }}
      prefix={prefix}
      customInput={CustomInput}
      decimalScale={precision}
      decimalSeparator=","
      fixedDecimalScale
      autoComplete="off"
      props={props}
    />
  )
}

const NumberInput = forwardRef(NumberInputWithRef)

export default NumberInput

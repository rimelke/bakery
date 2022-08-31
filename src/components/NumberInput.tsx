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
    textAlign="end"
  />
)

const CustomInput = forwardRef(CustomInputWithRef)

export interface NumberInputRef {
  setValue: (value?: number) => void
  focus: () => void
  select: () => void
  getValue: () => number | undefined
}

export interface NumberInputProps extends InputProps {
  precision?: number
  defaultValue?: number
  onValueChange?: (value?: number) => void
  suffix?: string
  value?: number
}

const NumberInputWithRef: ForwardRefRenderFunction<
  NumberInputRef,
  NumberInputProps
> = (
  {
    precision = 2,
    defaultValue,
    prefix,
    onValueChange = () => {},
    suffix,
    value: usedValue,
    ...props
  },
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
      getValue: () =>
        inputRef.current?.value
          ? Number(
              inputRef.current.value
                .replace(prefix || '', '')
                .replace(suffix || '', '')
                .replace(',', '.')
            )
          : undefined
    }),
    []
  )

  return (
    <NumberFormat
      value={usedValue ?? value}
      getInputRef={inputRef}
      onValueChange={(values, { source }) => {
        setValue(values.floatValue || '')

        if (source === 'prop') return

        onValueChange(values.floatValue)
      }}
      prefix={prefix}
      customInput={CustomInput}
      decimalScale={precision}
      decimalSeparator=","
      fixedDecimalScale
      autoComplete="off"
      suffix={suffix}
      props={props}
    />
  )
}

const NumberInput = forwardRef(NumberInputWithRef)

export default NumberInput

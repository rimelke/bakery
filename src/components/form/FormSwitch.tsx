import { Switch, SwitchProps } from '@chakra-ui/react'
import { useField } from '@unform/core'
import { useEffect, useRef } from 'react'

interface FormSwitchProps extends SwitchProps {
  name: string
}

const FormSwitch = ({ name, ...rest }: FormSwitchProps) => {
  const ref = useRef<HTMLInputElement>(null)
  const { fieldName, registerField, defaultValue } = useField(name)

  useEffect(() => {
    registerField({
      name: fieldName,
      getValue: () => ref.current?.checked
    })
  }, [fieldName, registerField])

  return <Switch {...rest} ref={ref} defaultChecked={defaultValue} />
}

export default FormSwitch

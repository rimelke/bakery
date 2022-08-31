import { FormHandles } from '@unform/core'
import * as yup from 'yup'

const validateData = async (
  data: any,
  schema: yup.AnySchema,
  form?: FormHandles | null
) => {
  try {
    if (form) form.setErrors({})

    return await schema.validate(data, {
      abortEarly: false
    })
  } catch (err) {
    if (form && err instanceof yup.ValidationError) {
      const validationErrors: Record<string, string> = {}

      err.inner.forEach((error) => {
        validationErrors[error.path as string] = error.message
      })

      form.setErrors(validationErrors)
    } else {
      console.error(err)
    }
  }
}

export default validateData

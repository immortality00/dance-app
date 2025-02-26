import { useState, useCallback, useEffect } from 'react';
import { z } from 'zod';
import { useFormValidation } from './useFormValidation';

interface UseFormOptions<T> {
  initialValues: T;
  validationSchema: z.ZodType<T>;
  onSubmit: (values: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface FormState<T> {
  values: T;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  submitCount: number;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
  validateOnChange = true,
  validateOnBlur = true,
}: UseFormOptions<T>) {
  const [formState, setFormState] = useState<FormState<T>>({
    values: initialValues,
    touched: {},
    isSubmitting: false,
    submitCount: 0,
  });

  const { errors, validateField, validateForm, clearErrors, setFieldError } = 
    useFormValidation<T>(validationSchema);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setFormState(prev => ({
      ...prev,
      values: { ...prev.values, [field]: value },
    }));

    if (validateOnChange) {
      validateField(field, value);
    }
  }, [validateOnChange, validateField]);

  const setFieldTouched = useCallback((field: keyof T, isTouched: boolean = true) => {
    setFormState(prev => ({
      ...prev,
      touched: { ...prev.touched, [field]: isTouched },
    }));

    if (validateOnBlur && isTouched) {
      validateField(field, formState.values[field]);
    }
  }, [validateOnBlur, validateField, formState.values]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setFormState(prev => ({
      ...prev,
      isSubmitting: true,
      submitCount: prev.submitCount + 1,
    }));

    const isValid = validateForm(formState.values);

    if (isValid) {
      try {
        await onSubmit(formState.values);
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach(err => {
            const field = err.path[0] as keyof T;
            setFieldError(field, err.message);
          });
        } else {
          console.error('Form submission error:', error);
        }
      }
    }

    setFormState(prev => ({
      ...prev,
      isSubmitting: false,
    }));
  }, [formState.values, validateForm, onSubmit, setFieldError]);

  const resetForm = useCallback(() => {
    setFormState({
      values: initialValues,
      touched: {},
      isSubmitting: false,
      submitCount: 0,
    });
    clearErrors();
  }, [initialValues, clearErrors]);

  // Validate form when validation schema changes
  useEffect(() => {
    validateForm(formState.values);
  }, [validationSchema, validateForm, formState.values]);

  return {
    values: formState.values,
    touched: formState.touched,
    errors,
    isSubmitting: formState.isSubmitting,
    submitCount: formState.submitCount,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    handleSubmit,
    resetForm,
    isValid: Object.keys(errors).length === 0,
    isDirty: Object.keys(formState.touched).length > 0,
  };
} 
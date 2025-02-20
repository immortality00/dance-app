import { useState, useCallback } from 'react';
import { z } from 'zod';

interface ValidationError {
  path: string[];
  message: string;
}

interface UseFormValidationResult<T> {
  errors: Record<string, string>;
  validateField: (field: keyof T, value: unknown) => boolean;
  validateForm: (data: T) => boolean;
  clearErrors: () => void;
  setFieldError: (field: keyof T, message: string) => void;
}

export function useFormValidation<T extends Record<string, any>>(
  schema: z.ZodType<T>
): UseFormValidationResult<T> {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback(
    (field: keyof T, value: unknown) => {
      try {
        // Validate the entire form data with just this field
        const partialData = { [field]: value } as T;
        schema.parse(partialData);
        
        // Clear error for this field if validation passes
        setErrors(prev => {
          const next = { ...prev };
          delete next[field as string];
          return next;
        });
        
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldError = error.errors[0];
          setErrors(prev => ({
            ...prev,
            [field as string]: fieldError.message,
          }));
        }
        return false;
      }
    },
    [schema]
  );

  const validateForm = useCallback(
    (data: T) => {
      try {
        schema.parse(data);
        setErrors({});
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const newErrors: Record<string, string> = {};
          error.errors.forEach((err) => {
            const path = err.path.join('.');
            newErrors[path] = err.message;
          });
          setErrors(newErrors);
        }
        return false;
      }
    },
    [schema]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setFieldError = useCallback((field: keyof T, message: string) => {
    setErrors(prev => ({
      ...prev,
      [field as string]: message,
    }));
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
    setFieldError,
  };
} 
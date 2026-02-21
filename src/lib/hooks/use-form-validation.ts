import { useState, useCallback } from "react";
import type { ZodSchema, ZodError } from "zod";

interface UseFormValidationReturn<T> {
  errors: Record<string, string>;
  validate: (data: unknown) => data is T;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  hasError: (field: string) => boolean;
  getError: (field: string) => string | undefined;
  setFieldError: (field: string, message: string) => void;
}

export function useFormValidation<T>(schema: ZodSchema<T>): UseFormValidationReturn<T> {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(
    (data: unknown): data is T => {
      const result = schema.safeParse(data);
      if (result.success) {
        setErrors({});
        return true;
      }

      const fieldErrors: Record<string, string> = {};
      for (const issue of (result as { success: false; error: ZodError }).error.issues) {
        const field = issue.path[0] as string;
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);

      // Scroll to first error field
      const firstField = Object.keys(fieldErrors)[0];
      if (firstField) {
        setTimeout(() => {
          const el =
            document.querySelector(`[name="${firstField}"]`) ||
            document.querySelector(`[data-field="${firstField}"]`);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      }

      return false;
    },
    [schema]
  );

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasError = useCallback(
    (field: string) => !!errors[field],
    [errors]
  );

  const getError = useCallback(
    (field: string) => errors[field],
    [errors]
  );

  const setFieldError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  return { errors, validate, clearError, clearAllErrors, hasError, getError, setFieldError };
}

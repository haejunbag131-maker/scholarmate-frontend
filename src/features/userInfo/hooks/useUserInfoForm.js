import { useCallback, useState } from "react";
import {
  buildUserInfoPayload,
  createInitialUserInfoForm,
} from "../utils/userInfoForm";

export default function useUserInfoForm(existingData) {
  const [form, setForm] = useState(() => createInitialUserInfoForm(existingData));

  const setField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setFields = useCallback((fields) => {
    setForm((prev) => ({ ...prev, ...fields }));
  }, []);

  const toggleField = useCallback((field) => {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const buildPayload = useCallback(() => buildUserInfoPayload(form), [form]);

  return {
    form,
    setField,
    setFields,
    toggleField,
    buildPayload,
  };
}

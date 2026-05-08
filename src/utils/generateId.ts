// src/utils/generateId.ts

import { v4 as uuidv4 } from "uuid";

export const generateId = () => {
  if (
    typeof window !== "undefined" &&
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {
    return window.crypto.randomUUID();
  }

  return uuidv4();
};
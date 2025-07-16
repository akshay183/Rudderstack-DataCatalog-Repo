import { Response } from "express";

export const compareEventData = (obj1: any, obj2: any) => {
  const missing_values = [null, undefined];
  for (const key in obj1) {
    if (
      missing_values.includes(obj1[key]) &&
      missing_values.includes(obj2[key]) &&
      obj1[key] !== obj2[key]
    ) {
      throw new Error(
        "Event/Property exist in DB, modification of it is not allowed"
      );
    }
  }
  return true;
};

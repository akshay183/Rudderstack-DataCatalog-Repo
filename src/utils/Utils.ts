import { Response } from "express";


export const compareEventData = (obj1: any, obj2: any, res: Response) => {
  for (const key in obj1) {
    if (obj1[key] !== undefined && obj2[key] !== undefined && obj1[key] !== obj2[key]) {
      res.status(409).json({ message: `${obj2.name} and type ${obj2.type} already exists with a different ${key}.` });
      return false;
    }
  }
  return true;
};
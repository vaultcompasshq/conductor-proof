import { nanoid } from "nanoid";

export function newId(prefix) {
  return `${prefix}_${nanoid(12)}`;
}

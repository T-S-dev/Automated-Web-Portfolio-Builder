export function removeInternalFields(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(removeInternalFields);
  } else if (obj !== null && typeof obj === "object") {
    const newObj: Record<string, any> = {};
    for (const key in obj) {
      if (["_id", "__v"].includes(key)) continue;
      newObj[key] = removeInternalFields(obj[key]);
    }
    return newObj;
  }
  return obj;
}

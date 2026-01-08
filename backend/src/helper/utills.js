export const isDifferent = (a, b) => {
  if (a == null && b == null) return false;
  return String(a) !== String(b);
};
export const isDateDifferent = (a, b) => {
  if (!a && !b) return false;
  if (!a || !b) return true;
  return new Date(a).getTime() !== new Date(b).getTime();
};

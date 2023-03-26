export const mapToList = <T>(
  records: Record<string, T>
): Array<T & { id: string }> => {
  return Object.entries(records).map(([key, record]) => ({
    id: key,
    ...record,
  }));
};

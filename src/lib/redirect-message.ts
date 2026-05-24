export function withMessage(pathname: string, message: string) {
  const params = new URLSearchParams({ message });

  return `${pathname}?${params.toString()}`;
}

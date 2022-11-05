export function useSwitch<T, P>(active: boolean, activeValue: T, inactiveValue: P) {
  return active ? activeValue : inactiveValue;
}

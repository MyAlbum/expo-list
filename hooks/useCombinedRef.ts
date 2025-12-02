import { useCallback } from "react";
type RefItem<T> = ((element: T | null) => void) | React.MutableRefObject<T | null> | null | undefined;

export const useCombinedRef = <T>(...refs: RefItem<T>[]) => {
    const callback = useCallback((element: T | null) => {
        for (const ref of refs) {
            if (!ref) {
                continue;
            }

            if (isFunction(ref)) {
                ref(element);
            } else {
                ref.current = element;
            }
        }
    }, [refs]);

    return callback;
};
export function isFunction(obj: unknown): obj is (...args: any[]) => any {
  return typeof obj === "function";
}
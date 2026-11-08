import { useState, useCallback } from 'react';
import { FormSchema } from '@openform-steps/core';

export function useHistory(initialState: FormSchema, maxDepth = 40) {
  const [past, setPast] = useState<FormSchema[]>([]);
  const [present, setPresent] = useState<FormSchema>(initialState);
  const [future, setFuture] = useState<FormSchema[]>([]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const set = useCallback(
    (newPresent: FormSchema | ((prev: FormSchema) => FormSchema)) => {
      setPresent((currentPresent) => {
        const resolved = typeof newPresent === 'function' ? newPresent(currentPresent) : newPresent;
        // Don't record if no change
        if (JSON.stringify(resolved) === JSON.stringify(currentPresent)) {
          return currentPresent;
        }

        setPast((prevPast) => {
          const updated = [...prevPast, currentPresent];
          return updated.length > maxDepth ? updated.slice(updated.length - maxDepth) : updated;
        });
        setFuture([]);
        return resolved;
      });
    },
    [maxDepth]
  );

  const undo = useCallback(() => {
    if (!canUndo) return;

    setPast((prevPast) => {
      const previous = prevPast[prevPast.length - 1];
      const newPast = prevPast.slice(0, prevPast.length - 1);

      setFuture((prevFuture) => [present, ...prevFuture]);
      setPresent(previous);
      return newPast;
    });
  }, [canUndo, present]);

  const redo = useCallback(() => {
    if (!canRedo) return;

    setFuture((prevFuture) => {
      const next = prevFuture[0];
      const newFuture = prevFuture.slice(1);

      setPast((prevPast) => [...prevPast, present]);
      setPresent(next);
      return newFuture;
    });
  }, [canRedo, present]);

  return {
    state: present,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}


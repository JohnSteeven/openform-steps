import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistory } from '../../packages/builder/src/hooks/useHistory';
import { createDefaultForm } from '../../packages/core/src/schema/defaults';

describe('Builder useHistory Hook', () => {
  it('initializes with default state and empty past/future', () => {
    const initial = createDefaultForm('Initial');
    const { result } = renderHook(() => useHistory(initial));

    expect(result.current.state.title).toBe('Initial');
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('records state transitions and allows undo and redo', () => {
    const initial = createDefaultForm('Initial');
    const { result } = renderHook(() => useHistory(initial));

    // Update 1
    act(() => {
      result.current.set((prev) => ({ ...prev, title: 'Second Title' }));
    });
    expect(result.current.state.title).toBe('Second Title');
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);

    // Update 2
    act(() => {
      result.current.set((prev) => ({ ...prev, title: 'Third Title' }));
    });
    expect(result.current.state.title).toBe('Third Title');

    // Undo 1
    act(() => {
      result.current.undo();
    });
    expect(result.current.state.title).toBe('Second Title');
    expect(result.current.canRedo).toBe(true);

    // Undo 2
    act(() => {
      result.current.undo();
    });
    expect(result.current.state.title).toBe('Initial');
    expect(result.current.canUndo).toBe(false);

    // Redo 1
    act(() => {
      result.current.redo();
    });
    expect(result.current.state.title).toBe('Second Title');
  });

  it('clears redo stack when a new mutation happens after undo', () => {
    const initial = createDefaultForm('Initial');
    const { result } = renderHook(() => useHistory(initial));

    act(() => {
      result.current.set((prev) => ({ ...prev, title: 'Branch A' }));
    });
    act(() => {
      result.current.undo();
    });
    expect(result.current.canRedo).toBe(true);

    // New action on branched history
    act(() => {
      result.current.set((prev) => ({ ...prev, title: 'Branch B' }));
    });
    expect(result.current.state.title).toBe('Branch B');
    expect(result.current.canRedo).toBe(false);
  });
});


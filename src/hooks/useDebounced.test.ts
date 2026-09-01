import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounced } from './useDebounced';

describe('useDebounced', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('devolve o valor inicial de imediato', () => {
    const { result } = renderHook(() => useDebounced('carta', 300));
    expect(result.current).toBe('carta');
  });

  it('só entrega o novo valor depois da pausa', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounced(v, 300), {
      initialProps: { v: '' },
    });

    rerender({ v: 'ca' });
    expect(result.current).toBe('');

    act(() => { vi.advanceTimersByTime(299); });
    expect(result.current).toBe('');

    act(() => { vi.advanceTimersByTime(1); });
    expect(result.current).toBe('ca');
  });

  // Este é o caso que justifica o hook: digitação contínua não pode gerar uma
  // consulta por tecla.
  it('descarta valores intermediários de quem continua digitando', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounced(v, 300), {
      initialProps: { v: '' },
    });

    for (const v of ['c', 'ca', 'car', 'cart', 'carta']) {
      rerender({ v });
      act(() => { vi.advanceTimersByTime(100); });
    }

    expect(result.current).toBe('');
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('carta');
  });
});

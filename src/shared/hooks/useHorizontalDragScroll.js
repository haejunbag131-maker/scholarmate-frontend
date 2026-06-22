import { useCallback, useRef, useState } from "react";

export default function useHorizontalDragScroll({ dragThreshold = 6 } = {}) {
  const scrollRef = useRef(null);
  const stateRef = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    scrollLeft: 0,
    dragging: false,
    hasPointerCapture: false,
    shouldBlockClick: false,
    resetTimer: null,
  });
  const [isDragging, setIsDragging] = useState(false);

  const clearClickBlock = useCallback(() => {
    const state = stateRef.current;
    if (state.resetTimer) window.clearTimeout(state.resetTimer);
    state.resetTimer = window.setTimeout(() => {
      state.shouldBlockClick = false;
      state.resetTimer = null;
    }, 0);
  }, []);

  const finishDrag = useCallback(
    (event) => {
      const state = stateRef.current;
      if (!state.active) return;

      if (state.pointerId !== null && state.hasPointerCapture) {
        try {
          event.currentTarget.releasePointerCapture(state.pointerId);
        } catch {
          /* pointer capture may already be released */
        }
      }

      state.active = false;
      state.pointerId = null;
      state.hasPointerCapture = false;
      state.shouldBlockClick = state.dragging;
      state.dragging = false;
      setIsDragging(false);
      clearClickBlock();
    },
    [clearClickBlock]
  );

  const onPointerDown = useCallback((event) => {
    if (event.button !== 0 || event.pointerType !== "mouse") return;

    const node = scrollRef.current;
    if (!node) return;

    const state = stateRef.current;
    state.active = true;
    state.pointerId = event.pointerId;
    state.startX = event.clientX;
    state.scrollLeft = node.scrollLeft;
    state.dragging = false;
    state.hasPointerCapture = false;
    state.shouldBlockClick = false;
  }, []);

  const onPointerMove = useCallback(
    (event) => {
      const state = stateRef.current;
      const node = scrollRef.current;
      if (!state.active || !node) return;

      const distance = event.clientX - state.startX;
      if (!state.dragging && Math.abs(distance) < dragThreshold) return;

      if (!state.dragging) {
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
          state.hasPointerCapture = true;
        } catch {
          state.hasPointerCapture = false;
        }
      }

      state.dragging = true;
      setIsDragging(true);
      node.scrollLeft = state.scrollLeft - distance;
      event.preventDefault();
    },
    [dragThreshold]
  );

  const onClickCapture = useCallback((event) => {
    const state = stateRef.current;
    if (!state.shouldBlockClick) return;

    state.shouldBlockClick = false;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return {
    scrollRef,
    isDragging,
    dragScrollProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finishDrag,
      onPointerCancel: finishDrag,
      onClickCapture,
    },
  };
}

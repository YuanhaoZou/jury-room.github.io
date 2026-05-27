import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

export type Point = { x: number; y: number };

function clampPosition(
  pos: Point,
  width: number,
  height: number,
  margin = 12,
): Point {
  const maxX = Math.max(margin, window.innerWidth - width - margin);
  const maxY = Math.max(margin, window.innerHeight - height - margin);
  return {
    x: Math.min(maxX, Math.max(margin, pos.x)),
    y: Math.min(maxY, Math.max(margin, pos.y)),
  };
}

export function defaultFloatingPosition(panelW = 360, panelH = 420): Point {
  if (typeof window === "undefined") return { x: 24, y: 24 };
  return {
    x: window.innerWidth - panelW - 24,
    y: window.innerHeight - panelH - 24,
  };
}

export function useDragPosition(
  initial: Point,
  panelSize: { width: number; height: number },
) {
  const [pos, setPos] = useState<Point>(() =>
    clampPosition(initial, panelSize.width, panelSize.height),
  );
  const dragRef = useRef<{ active: boolean; ox: number; oy: number }>({
    active: false,
    ox: 0,
    oy: 0,
  });

  useEffect(() => {
    const onResize = () => {
      setPos((p) =>
        clampPosition(p, panelSize.width, panelSize.height),
      );
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [panelSize.width, panelSize.height]);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest("button, textarea, input, select, a")) return;
      dragRef.current = {
        active: true,
        ox: e.clientX - pos.x,
        oy: e.clientY - pos.y,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
      e.preventDefault();
    },
    [pos.x, pos.y],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!dragRef.current.active) return;
      setPos(
        clampPosition(
          {
            x: e.clientX - dragRef.current.ox,
            y: e.clientY - dragRef.current.oy,
          },
          panelSize.width,
          panelSize.height,
        ),
      );
    },
    [panelSize.width, panelSize.height],
  );

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLElement>) => {
    dragRef.current.active = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  return { pos, setPos, onPointerDown, onPointerMove, onPointerUp };
}

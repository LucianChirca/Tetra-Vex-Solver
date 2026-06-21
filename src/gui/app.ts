// Lifecycle: construct a view, then App.run() calls start?() once and drives
// update/draw each frame. App.run must call handlePointer via `view.handlePointer?.(e)`.
export interface View {
  start?(): void;
  handlePointer?(e: PointerEvent): void;
  update(dt: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
}

// Owns the canvas + requestAnimationFrame loop; runs the active View.
export class App {
  private readonly n: number;
  private readonly mount: HTMLElement;
  private canvas!: HTMLCanvasElement; // created inside `mount` in run()
  private ctx!: CanvasRenderingContext2D;

  constructor(mount: HTMLElement, n: number) {
    this.mount = mount;
    this.n = n;
  }

  run(view: View): void {
    throw new Error("not implemented");
  }
}

// Mounted into a container; builds its own DOM and tears it down. No shared
// render loop — each view owns its input and timing.
export interface View {
  mount(parent: HTMLElement): void;
  destroy(): void;
}

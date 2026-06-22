// Mounted into a container; builds its own UI and tears it down. No shared
// render loop — each view owns its input and timing. A view composes the
// component library according to the model and handles its own concerns
// (drag tracking, solver stepping).
export interface View {
  mount(parent: HTMLElement): void;
  destroy(): void;
}

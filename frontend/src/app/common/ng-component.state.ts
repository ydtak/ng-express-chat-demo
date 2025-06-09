export interface NgComponentState<T> {
  updateStateAndNotify(state: Partial<T>): void;
}

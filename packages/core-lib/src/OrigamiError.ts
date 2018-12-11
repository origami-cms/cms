export class OrigamiError extends Error {
  public code: string;
  public showTrace: boolean = true;

  /**
   * A custom error in Origami
   * @param namespace Global namespace of the error
   * @param name Name of the error
   * @param message Error message
   * @param code Response code to send
   */
  constructor(
    public namespace: string = 'Origami',
    public name: string,
    public message: string,
    code?: string
  ) {
    super();
    this.code = code || `${namespace}.${name}`;
  }
}

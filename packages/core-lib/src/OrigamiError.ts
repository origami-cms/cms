export class OrigamiError extends Error {
  public code: string;
  public showTrace: boolean = true;

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

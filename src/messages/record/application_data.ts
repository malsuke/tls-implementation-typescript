export class ApplicationData {
  constructor(public data: Uint8Array) {}

  public static parse(data: Uint8Array): ApplicationData {
    return new ApplicationData(new Uint8Array(data))
  }

  public marshal(): Uint8Array {
    return new Uint8Array(this.data)
  }
}

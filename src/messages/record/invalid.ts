export class Invalid {
  constructor(public payload: Uint8Array) {}

  public static parse(data: Uint8Array): Invalid {
    return new Invalid(new Uint8Array(data))
  }

  public marshal(): Uint8Array {
    return new Uint8Array(this.payload)
  }
}

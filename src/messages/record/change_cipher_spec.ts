export class ChangeCipherSpec {
  constructor(public type: number) {}

  public static parse(data: Uint8Array): ChangeCipherSpec {
    if (data.length < 1) {
      throw new Error('ChangeCipherSpec message too short')
    }

    const type = data[0]

    if (type !== 1) {
      throw new Error('invalid ChangeCipherSpec type')
    }

    if (data.length > 1) {
      throw new Error('ChangeCipherSpec has trailing bytes')
    }

    return new ChangeCipherSpec(type)
  }

  public marshal(): Uint8Array {
    return new Uint8Array([this.type])
  }

  public static create(): ChangeCipherSpec {
    return new ChangeCipherSpec(1)
  }
}

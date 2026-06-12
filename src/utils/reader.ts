export class Reader {
  private offset: number = 0

  constructor(private readonly data: Uint8Array) {}

  public get unreadBytes(): number {
    return this.data.length - this.offset
  }

  public get isEmpty(): boolean {
    return this.unreadBytes === 0
  }

  public readUint8(): number {
    if (this.unreadBytes < 1) throw new Error('Data too short to read Uint8')
    const value = this.data[this.offset] as number
    this.offset += 1
    return value
  }

  public readUint16(): number {
    if (this.unreadBytes < 2) throw new Error('Data too short to read Uint16')
    const value = ((this.data[this.offset] as number) << 8) | (this.data[this.offset + 1] as number)
    this.offset += 2
    return value
  }

  public readUint24(): number {
    if (this.unreadBytes < 3) throw new Error('Data too short to read Uint24')
    const value =
      ((this.data[this.offset] as number) << 16) |
      ((this.data[this.offset + 1] as number) << 8) |
      (this.data[this.offset + 2] as number)
    this.offset += 3
    return value
  }

  public readUint32(): number {
    if (this.unreadBytes < 4) throw new Error('Data too short to read Uint32')
    const value =
      ((this.data[this.offset] as number) << 24) |
      ((this.data[this.offset + 1] as number) << 16) |
      ((this.data[this.offset + 2] as number) << 8) |
      (this.data[this.offset + 3] as number)
    this.offset += 4
    return value >>> 0
  }

  public readBytes(length: number): Uint8Array {
    if (this.unreadBytes < length) throw new Error('Data too short to read bytes')
    const bytes = this.data.slice(this.offset, this.offset + length)
    this.offset += length
    return bytes
  }

  public readUint8LengthPrefixed(): Uint8Array {
    const length = this.readUint8()
    return this.readBytes(length)
  }

  public readUint16LengthPrefixed(): Uint8Array {
    const length = this.readUint16()
    return this.readBytes(length)
  }

  public readUint24LengthPrefixed(): Uint8Array {
    const length = this.readUint24()
    return this.readBytes(length)
  }
}

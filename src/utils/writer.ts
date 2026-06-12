export class Writer {
  private chunks: Uint8Array[] = []

  public writeUint8(value: number): void {
    this.chunks.push(new Uint8Array([value & 0xff]))
  }

  public writeUint16(value: number): void {
    this.chunks.push(new Uint8Array([(value >> 8) & 0xff, value & 0xff]))
  }

  public writeUint24(value: number): void {
    this.chunks.push(new Uint8Array([(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff]))
  }

  public writeUint32(value: number): void {
    this.chunks.push(
      new Uint8Array([
        (value >>> 24) & 0xff,
        (value >>> 16) & 0xff,
        (value >>> 8) & 0xff,
        value & 0xff,
      ])
    )
  }

  public writeBytes(bytes: Uint8Array): void {
    this.chunks.push(bytes)
  }

  public writeUint8LengthPrefixed(fn: (writer: Writer) => void): void {
    const innerWriter = new Writer()
    fn(innerWriter)
    const innerBytes = innerWriter.bytes()
    if (innerBytes.length > 0xff) throw new Error('Length exceeds Uint8 capacity')
    this.writeUint8(innerBytes.length)
    this.writeBytes(innerBytes)
  }

  public writeUint16LengthPrefixed(fn: (writer: Writer) => void): void {
    const innerWriter = new Writer()
    fn(innerWriter)
    const innerBytes = innerWriter.bytes()
    if (innerBytes.length > 0xffff) throw new Error('Length exceeds Uint16 capacity')
    this.writeUint16(innerBytes.length)
    this.writeBytes(innerBytes)
  }

  public writeUint24LengthPrefixed(fn: (writer: Writer) => void): void {
    const innerWriter = new Writer()
    fn(innerWriter)
    const innerBytes = innerWriter.bytes()
    if (innerBytes.length > 0xffffff) throw new Error('Length exceeds Uint24 capacity')
    this.writeUint24(innerBytes.length)
    this.writeBytes(innerBytes)
  }

  public bytes(): Uint8Array {
    const totalLength = this.chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of this.chunks) {
      result.set(chunk, offset)
      offset += chunk.length
    }
    return result
  }
}

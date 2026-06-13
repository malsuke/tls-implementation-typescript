export interface Writer {
  chunks: Uint8Array[]
}

export const createWriter = (): Writer => ({
  chunks: [],
})

export const writeUint8 = (writer: Writer, value: number): void => {
  writer.chunks.push(new Uint8Array([value & 0xff]))
}

export const writeUint16 = (writer: Writer, value: number): void => {
  writer.chunks.push(new Uint8Array([(value >> 8) & 0xff, value & 0xff]))
}

export const writeUint24 = (writer: Writer, value: number): void => {
  writer.chunks.push(new Uint8Array([(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff]))
}

export const writeUint32 = (writer: Writer, value: number): void => {
  writer.chunks.push(
    new Uint8Array([
      (value >>> 24) & 0xff,
      (value >>> 16) & 0xff,
      (value >>> 8) & 0xff,
      value & 0xff,
    ])
  )
}

export const writeBytes = (writer: Writer, bytes: Uint8Array): void => {
  writer.chunks.push(bytes)
}

export const getBytes = (writer: Writer): Uint8Array => {
  const totalLength = writer.chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of writer.chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }
  return result
}

export const writeUint8LengthPrefixed = (
  writer: Writer,
  fn: (innerWriter: Writer) => void
): void => {
  const innerWriter = createWriter()
  fn(innerWriter)
  const innerBytes = getBytes(innerWriter)
  if (innerBytes.length > 0xff) throw new Error('Length exceeds Uint8 capacity')
  writeUint8(writer, innerBytes.length)
  writeBytes(writer, innerBytes)
}

export const writeUint16LengthPrefixed = (
  writer: Writer,
  fn: (innerWriter: Writer) => void
): void => {
  const innerWriter = createWriter()
  fn(innerWriter)
  const innerBytes = getBytes(innerWriter)
  if (innerBytes.length > 0xffff) throw new Error('Length exceeds Uint16 capacity')
  writeUint16(writer, innerBytes.length)
  writeBytes(writer, innerBytes)
}

export const writeUint24LengthPrefixed = (
  writer: Writer,
  fn: (innerWriter: Writer) => void
): void => {
  const innerWriter = createWriter()
  fn(innerWriter)
  const innerBytes = getBytes(innerWriter)
  if (innerBytes.length > 0xffffff) throw new Error('Length exceeds Uint24 capacity')
  writeUint24(writer, innerBytes.length)
  writeBytes(writer, innerBytes)
}

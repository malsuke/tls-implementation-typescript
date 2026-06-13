export interface Reader {
  data: Uint8Array
  offset: number
}

export const createReader = (data: Uint8Array): Reader => ({
  data,
  offset: 0,
})

export const getUnreadBytes = (reader: Reader): number => {
  return reader.data.length - reader.offset
}

export const isEmpty = (reader: Reader): boolean => {
  return getUnreadBytes(reader) === 0
}

export const readUint8 = (reader: Reader): number => {
  if (getUnreadBytes(reader) < 1) throw new Error('Data too short to read Uint8')
  const value = reader.data[reader.offset] as number
  reader.offset += 1
  return value
}

export const readUint16 = (reader: Reader): number => {
  if (getUnreadBytes(reader) < 2) throw new Error('Data too short to read Uint16')
  const value =
    ((reader.data[reader.offset] as number) << 8) | (reader.data[reader.offset + 1] as number)
  reader.offset += 2
  return value
}

export const readUint24 = (reader: Reader): number => {
  if (getUnreadBytes(reader) < 3) throw new Error('Data too short to read Uint24')
  const value =
    ((reader.data[reader.offset] as number) << 16) |
    ((reader.data[reader.offset + 1] as number) << 8) |
    (reader.data[reader.offset + 2] as number)
  reader.offset += 3
  return value
}

export const readUint32 = (reader: Reader): number => {
  if (getUnreadBytes(reader) < 4) throw new Error('Data too short to read Uint32')
  const value =
    ((reader.data[reader.offset] as number) << 24) |
    ((reader.data[reader.offset + 1] as number) << 16) |
    ((reader.data[reader.offset + 2] as number) << 8) |
    (reader.data[reader.offset + 3] as number)
  reader.offset += 4
  return value >>> 0
}

export const readBytes = (reader: Reader, length: number): Uint8Array => {
  if (getUnreadBytes(reader) < length) throw new Error('Data too short to read bytes')
  const bytes = reader.data.slice(reader.offset, reader.offset + length)
  reader.offset += length
  return bytes
}

export const readUint8LengthPrefixed = (reader: Reader): Uint8Array => {
  const length = readUint8(reader)
  return readBytes(reader, length)
}

export const readUint16LengthPrefixed = (reader: Reader): Uint8Array => {
  const length = readUint16(reader)
  return readBytes(reader, length)
}

export const readUint24LengthPrefixed = (reader: Reader): Uint8Array => {
  const length = readUint24(reader)
  return readBytes(reader, length)
}

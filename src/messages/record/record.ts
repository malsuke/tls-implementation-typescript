import { type ContentType, TLSVersion } from '../../protocol/constants'
import { Reader } from '../../utils/reader'
import { Writer } from '../../utils/writer'

export const MAX_PAYLOAD_LEN = 16384 // 2^14
export const RECORD_HEADER_LEN = 5

export class TLSPlaintext {
  constructor(
    public type: ContentType,
    public version: TLSVersion,
    public length: number,
    public payload: Uint8Array
  ) {}

  public static create(contentType: ContentType, fragment: Uint8Array): TLSPlaintext {
    if (fragment.length > MAX_PAYLOAD_LEN) {
      throw new Error('tls: payload too large')
    }
    return new TLSPlaintext(
      contentType,
      TLSVersion.TLS_1_2, // TLS 1.3 uses 0x0303 for compatibility
      fragment.length,
      fragment
    )
  }

  public marshal(): Uint8Array {
    const writer = new Writer()
    writer.writeUint8(this.type)
    writer.writeUint16(this.version)
    writer.writeUint16(this.length)
    writer.writeBytes(this.payload)
    return writer.bytes()
  }

  public header(): Uint8Array {
    const writer = new Writer()
    writer.writeUint8(this.type)
    writer.writeUint16(this.version)
    writer.writeUint16(this.length)
    return writer.bytes()
  }

  public static parse(data: Uint8Array): TLSPlaintext {
    const reader = new Reader(data)
    const type = reader.readUint8() as ContentType
    const version = reader.readUint16() as TLSVersion
    const length = reader.readUint16()

    if (reader.unreadBytes < length) {
      throw new Error('tls: data length mismatch')
    }
    const payload = reader.readBytes(length)

    return new TLSPlaintext(type, version, length, payload)
  }

  public static parseHeader(data: Uint8Array): Pick<TLSPlaintext, 'type' | 'version' | 'length'> {
    if (data.length < RECORD_HEADER_LEN) {
      throw new Error('tls: data too short')
    }
    const reader = new Reader(data.slice(0, RECORD_HEADER_LEN))
    const type = reader.readUint8() as ContentType
    const version = reader.readUint16() as TLSVersion
    const length = reader.readUint16()
    return { type, version, length }
  }
}

export class TLSInnerPlaintext {
  constructor(
    public content: Uint8Array,
    public type: ContentType,
    public padding: Uint8Array
  ) {}

  public marshal(): Uint8Array {
    const writer = new Writer()
    writer.writeBytes(this.content)
    writer.writeUint8(this.type)
    if (this.padding.length > 0) {
      writer.writeBytes(this.padding)
    }
    return writer.bytes()
  }

  public static parse(data: Uint8Array): TLSInnerPlaintext {
    if (data.length < 1) {
      throw new Error('tls: inner plaintext too short')
    }

    let typeIndex = -1
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i] !== 0) {
        typeIndex = i
        break
      }
    }

    if (typeIndex < 0) {
      throw new Error('tls: inner plaintext missing content type')
    }

    const content = data.slice(0, typeIndex)
    const type = data[typeIndex] as ContentType
    const padding = data.slice(typeIndex + 1)

    return new TLSInnerPlaintext(content, type, padding)
  }
}

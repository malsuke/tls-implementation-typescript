import type { HandshakeType } from '../../../protocol/constants'
import { Reader } from '../../../utils/reader'
import { Writer } from '../../../utils/writer'

export const MAX_HANDSHAKE_BODY_LEN = 0xffffff

export interface HandshakeMessage {
  type(): HandshakeType
  marshal(): Uint8Array
}

export class Handshake {
  constructor(
    public handshakeType: HandshakeType,
    public length: number,
    public body: Uint8Array
  ) {}

  public static create(msg: HandshakeMessage): Handshake {
    const body = msg.marshal()
    const len = body.length
    if (len > MAX_HANDSHAKE_BODY_LEN) {
      throw new Error('tls: handshake body too large')
    }
    return new Handshake(msg.type(), len, body)
  }

  public marshal(): Uint8Array {
    const writer = new Writer()
    writer.writeUint8(this.handshakeType)
    writer.writeUint24(this.length)
    writer.writeBytes(this.body)
    return writer.bytes()
  }

  public static parse(data: Uint8Array): Handshake {
    const reader = new Reader(data)
    const handshakeType = reader.readUint8() as HandshakeType
    const length = reader.readUint24()
    if (reader.unreadBytes < length) {
      throw new Error('tls: handshake body length mismatch')
    }
    const body = reader.readBytes(length)
    return new Handshake(handshakeType, length, body)
  }
}

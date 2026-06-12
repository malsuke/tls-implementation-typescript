import { HandshakeType } from '../../../protocol/constants'
import { Reader } from '../../../utils/reader'
import type { HandshakeMessage } from './handshake'
import { stripHandshakeHeader } from './unmarshal_helpers'

export class KeyUpdate implements HandshakeMessage {
  constructor(public updateRequested: boolean) {}

  public type(): HandshakeType {
    return HandshakeType.KeyUpdate
  }

  public marshal(): Uint8Array {
    return new Uint8Array([this.updateRequested ? 1 : 0])
  }

  public static parse(data: Uint8Array): KeyUpdate {
    const body = stripHandshakeHeader(data, HandshakeType.KeyUpdate)

    if (body.length !== 1) {
      throw new Error(`invalid KeyUpdate length: ${body.length}`)
    }

    const reader = new Reader(body)
    const requestUpdate = reader.readUint8()

    if (requestUpdate === 0) {
      return new KeyUpdate(false)
    } else if (requestUpdate === 1) {
      return new KeyUpdate(true)
    } else {
      throw new Error(`invalid KeyUpdate request value: ${requestUpdate}`)
    }
  }
}

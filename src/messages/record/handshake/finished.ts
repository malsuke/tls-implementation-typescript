import { HandshakeType } from '../../../protocol/constants'
import type { HandshakeMessage } from './handshake'
import { stripHandshakeHeader } from './unmarshal_helpers'

export class Finished implements HandshakeMessage {
  constructor(public verifyData: Uint8Array) {}

  public type(): HandshakeType {
    return HandshakeType.Finished
  }

  public marshal(): Uint8Array {
    return new Uint8Array(this.verifyData)
  }

  public static parse(data: Uint8Array): Finished {
    const body = stripHandshakeHeader(data, HandshakeType.Finished)
    return new Finished(new Uint8Array(body))
  }
}

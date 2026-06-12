import { HandshakeType } from '../../../protocol/constants'
import { Reader } from '../../../utils/reader'
import { stripHandshakeHeader } from './unmarshal_helpers'

export class Certificate {
  constructor(public certificates: Uint8Array[]) {}

  public static parse(data: Uint8Array): Certificate {
    const body = stripHandshakeHeader(data, HandshakeType.Certificate)
    const reader = new Reader(body)

    const context = reader.readUint8LengthPrefixed()
    if (context.length !== 0) {
      throw new Error('invalid certificate context')
    }

    const certList = reader.readUint24LengthPrefixed()
    if (!reader.isEmpty) {
      throw new Error('failed to read certificate list')
    }

    const listReader = new Reader(certList)
    const certificates: Uint8Array[] = []

    while (!listReader.isEmpty) {
      const cert = listReader.readUint24LengthPrefixed()
      listReader.readUint16LengthPrefixed()
      certificates.push(new Uint8Array(cert))
    }

    return new Certificate(certificates)
  }
}

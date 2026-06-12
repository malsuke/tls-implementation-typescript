import { ExtensionType } from '../../../../protocol/constants'
import { Reader } from '../../../../utils/reader'
import { Writer } from '../../../../utils/writer'
import type { ExtensionData } from './extension'

export class Cookie implements ExtensionData {
  constructor(public cookie: Uint8Array) {}

  public type(): ExtensionType {
    return ExtensionType.Cookie
  }

  public marshalPayload(): Uint8Array {
    const writer = new Writer()
    writer.writeUint16LengthPrefixed(w => {
      w.writeBytes(this.cookie)
    })
    return writer.bytes()
  }

  public static unmarshal(payload: Uint8Array): Cookie {
    const reader = new Reader(payload)
    const cookie = reader.readUint16LengthPrefixed()

    if (cookie.length === 0 || !reader.isEmpty) {
      throw new Error('failed to parse cookie')
    }

    return new Cookie(cookie)
  }
}

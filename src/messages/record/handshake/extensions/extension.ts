import type { ExtensionType } from '../../../../protocol/constants'
import { Reader } from '../../../../utils/reader'
import { Writer } from '../../../../utils/writer'

export interface ExtensionData {
  type(): ExtensionType
  marshalPayload(): Uint8Array
}

export class Extension {
  constructor(
    public type: ExtensionType,
    public payload: Uint8Array
  ) {}

  public static create(data: ExtensionData): Extension {
    return new Extension(data.type(), data.marshalPayload())
  }

  public marshal(): Uint8Array {
    const writer = new Writer()
    writer.writeUint16(this.type)
    writer.writeUint16LengthPrefixed(w => {
      w.writeBytes(this.payload)
    })
    return writer.bytes()
  }

  public static unmarshalExtensions(data: Uint8Array): Extension[] {
    const exts: Extension[] = []
    const reader = new Reader(data)

    while (!reader.isEmpty) {
      const extType = reader.readUint16() as ExtensionType
      const payload = reader.readUint16LengthPrefixed()
      exts.push(new Extension(extType, payload))
    }

    return exts
  }
}

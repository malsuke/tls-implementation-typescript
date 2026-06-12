import { CurveID, ExtensionType } from '../../../../protocol/constants'
import { Reader } from '../../../../utils/reader'
import { Writer } from '../../../../utils/writer'
import { Extension, type ExtensionData } from './extension'

export interface KeyShareEntry {
  group: CurveID
  data: Uint8Array
}

export class KeyShareExtension implements ExtensionData {
  constructor(public keyShares: KeyShareEntry[]) {}

  public type(): ExtensionType {
    return ExtensionType.KeyShare
  }

  public marshalPayload(): Uint8Array {
    const writer = new Writer()
    writer.writeUint16LengthPrefixed(w1 => {
      for (const ks of this.keyShares) {
        w1.writeUint16(ks.group)
        w1.writeUint16LengthPrefixed(w2 => {
          w2.writeBytes(ks.data)
        })
      }
    })
    return writer.bytes()
  }

  public static unmarshalClient(payload: Uint8Array): KeyShareExtension {
    const reader = new Reader(payload)
    const shareList = reader.readUint16LengthPrefixed()
    const listReader = new Reader(shareList)

    const keyShares: KeyShareEntry[] = []
    while (!listReader.isEmpty) {
      const group = listReader.readUint16() as CurveID
      const data = listReader.readUint16LengthPrefixed()
      keyShares.push({ group, data })
    }

    return new KeyShareExtension(keyShares)
  }

  public static unmarshalServer(payload: Uint8Array): {
    share?: KeyShareEntry
    selectedGroup?: CurveID
  } {
    const reader = new Reader(payload)

    if (payload.length === 2) {
      const selectedGroup = reader.readUint16() as CurveID
      return { selectedGroup }
    }

    const group = reader.readUint16() as CurveID
    const data = reader.readUint16LengthPrefixed()

    if (!reader.isEmpty) {
      throw new Error('failed to parse key share server')
    }

    return { share: { group, data } }
  }

  public static createExtension(publicKey: Uint8Array): Extension {
    return Extension.create(new KeyShareExtension([{ group: CurveID.X25519, data: publicKey }]))
  }
}

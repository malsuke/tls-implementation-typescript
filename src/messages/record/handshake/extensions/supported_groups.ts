import { CurveID, ExtensionType } from '../../../../protocol/constants'
import { Reader } from '../../../../utils/reader'
import { Writer } from '../../../../utils/writer'
import { Extension, type ExtensionData } from './extension'

export class SupportedGroups implements ExtensionData {
  constructor(public groups: CurveID[]) {}

  public type(): ExtensionType {
    return ExtensionType.SupportedGroups
  }

  public marshalPayload(): Uint8Array {
    const writer = new Writer()
    writer.writeUint16LengthPrefixed(w => {
      for (const g of this.groups) {
        w.writeUint16(g)
      }
    })
    return writer.bytes()
  }

  public static unmarshal(payload: Uint8Array): SupportedGroups {
    const reader = new Reader(payload)
    const curveList = reader.readUint16LengthPrefixed()

    if (curveList.length === 0 || curveList.length % 2 !== 0) {
      throw new Error('failed to parse supported groups')
    }

    const listReader = new Reader(curveList)
    const groups: CurveID[] = []
    while (!listReader.isEmpty) {
      groups.push(listReader.readUint16() as CurveID)
    }

    return new SupportedGroups(groups)
  }

  public static createExtension(): Extension {
    return Extension.create(new SupportedGroups([CurveID.X25519]))
  }
}

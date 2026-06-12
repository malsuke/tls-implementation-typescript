import { ExtensionType } from '../../../../protocol/constants'
import { Reader } from '../../../../utils/reader'
import { Writer } from '../../../../utils/writer'
import { Extension, type ExtensionData } from './extension'

export enum PSKKeyExchangeMode {
  PSKModePlain = 0,
  PSKModeDHE = 1,
}

export class PSKKeyExchangeModes implements ExtensionData {
  constructor(public modes: PSKKeyExchangeMode[]) {}

  public type(): ExtensionType {
    return ExtensionType.PskKeyExchangeModes
  }

  public marshalPayload(): Uint8Array {
    const writer = new Writer()
    writer.writeUint8LengthPrefixed(w => {
      for (const m of this.modes) {
        w.writeUint8(m)
      }
    })
    return writer.bytes()
  }

  public static unmarshal(payload: Uint8Array): PSKKeyExchangeModes {
    const reader = new Reader(payload)
    const modeList = reader.readUint8LengthPrefixed()

    if (modeList.length === 0) {
      throw new Error('failed to parse psk key exchange modes')
    }

    const listReader = new Reader(modeList)
    const modes: PSKKeyExchangeMode[] = []
    while (!listReader.isEmpty) {
      modes.push(listReader.readUint8() as PSKKeyExchangeMode)
    }

    return new PSKKeyExchangeModes(modes)
  }

  public static createExtension(): Extension {
    return Extension.create(new PSKKeyExchangeModes([PSKKeyExchangeMode.PSKModeDHE]))
  }
}

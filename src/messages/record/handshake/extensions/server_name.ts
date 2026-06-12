import { ExtensionType } from '../../../../protocol/constants'
import { Reader } from '../../../../utils/reader'
import { Writer } from '../../../../utils/writer'
import { Extension, type ExtensionData } from './extension'

export class ServerName implements ExtensionData {
  constructor(public serverName: string) {}

  public type(): ExtensionType {
    return ExtensionType.ServerName
  }

  public marshalPayload(): Uint8Array {
    const writer = new Writer()
    writer.writeUint16LengthPrefixed(w1 => {
      // NameType: host_name (0)
      w1.writeUint8(0)
      // HostName
      w1.writeUint16LengthPrefixed(w2 => {
        w2.writeBytes(new TextEncoder().encode(this.serverName))
      })
    })
    return writer.bytes()
  }

  public static unmarshal(payload: Uint8Array): ServerName {
    const reader = new Reader(payload)
    const nameList = reader.readUint16LengthPrefixed()
    const listReader = new Reader(nameList)

    while (!listReader.isEmpty) {
      const nameType = listReader.readUint8()
      const nameBytes = listReader.readUint16LengthPrefixed()

      if (nameType !== 0) {
        continue
      }

      const serverName = new TextDecoder().decode(nameBytes)
      if (serverName.endsWith('.')) {
        throw new Error('failed to parse server name')
      }
      return new ServerName(serverName)
    }

    throw new Error('failed to parse server name')
  }

  public static createExtension(servername: string): Extension {
    return Extension.create(new ServerName(servername))
  }
}

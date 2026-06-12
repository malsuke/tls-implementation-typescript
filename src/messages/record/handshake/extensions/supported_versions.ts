import { ExtensionType, TLSVersion } from '../../../../protocol/constants'
import { Reader } from '../../../../utils/reader'
import { Writer } from '../../../../utils/writer'
import { Extension, type ExtensionData } from './extension'

export class SupportedVersions implements ExtensionData {
  constructor(public versions: TLSVersion[]) {}

  public type(): ExtensionType {
    return ExtensionType.SupportedVersions
  }

  public marshalPayload(): Uint8Array {
    const writer = new Writer()
    writer.writeUint8LengthPrefixed(w => {
      for (const v of this.versions) {
        w.writeUint16(v)
      }
    })
    return writer.bytes()
  }

  public static unmarshalClient(payload: Uint8Array): SupportedVersions {
    const reader = new Reader(payload)
    const versionList = reader.readUint8LengthPrefixed()

    if (versionList.length === 0 || versionList.length % 2 !== 0) {
      throw new Error('failed to parse supported versions')
    }

    const listReader = new Reader(versionList)
    const versions: TLSVersion[] = []
    while (!listReader.isEmpty) {
      versions.push(listReader.readUint16() as TLSVersion)
    }

    return new SupportedVersions(versions)
  }

  public static unmarshalServer(payload: Uint8Array): TLSVersion {
    if (payload.length !== 2) {
      throw new Error('failed to parse supported versions')
    }
    const reader = new Reader(payload)
    return reader.readUint16() as TLSVersion
  }

  public static createExtension(): Extension {
    return Extension.create(new SupportedVersions([TLSVersion.TLS_1_3]))
  }
}

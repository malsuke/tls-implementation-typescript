import { ExtensionType, HandshakeType } from '../../../protocol/constants'
import { Reader } from '../../../utils/reader'
import { Extension } from './extensions/extension'
import { stripHandshakeHeader } from './unmarshal_helpers'

export class EncryptedExtensions {
  constructor(
    public extensions: Extension[],
    public serverNameAck: boolean
  ) {}

  public static parse(data: Uint8Array): EncryptedExtensions {
    const body = stripHandshakeHeader(data, HandshakeType.EncryptedExtensions)
    const reader = new Reader(body)

    const extData = reader.readUint16LengthPrefixed()
    const exts = Extension.unmarshalExtensions(extData)

    const extensions: Extension[] = []
    let serverNameAck = false

    const seenExts = new Set<ExtensionType>()
    for (const ext of exts) {
      if (seenExts.has(ext.type)) {
        throw new Error(`duplicate extension: ${ext.type}`)
      }
      seenExts.add(ext.type)

      if (ext.type === ExtensionType.ServerName) {
        if (ext.payload.length !== 0) {
          throw new Error('server_name extension in EncryptedExtensions must be empty')
        }
        serverNameAck = true
      } else {
        extensions.push(ext)
      }
    }

    return new EncryptedExtensions(extensions, serverNameAck)
  }
}

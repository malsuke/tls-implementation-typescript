import { ExtensionType, HandshakeType } from '../../../protocol/constants'
import { createReader, readUint16LengthPrefixed } from '../../../utils/reader'
import { type Extension, parseExtensions } from './extensions/extension'
import { stripHandshakeHeader } from './unmarshal_helpers'

export interface EncryptedExtensions {
  extensions: Extension[]
  serverNameAck: boolean
}

export const unmarshalEncryptedExtensions = (data: Uint8Array): EncryptedExtensions => {
  const body = stripHandshakeHeader(data, HandshakeType.EncryptedExtensions)
  const reader = createReader(body)

  const extData = readUint16LengthPrefixed(reader)
  const exts = parseExtensions(extData)

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

  return { extensions, serverNameAck }
}

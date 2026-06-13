import type { ExtensionType } from '../../../../protocol/constants'
import {
  createReader,
  isEmpty,
  readUint16,
  readUint16LengthPrefixed,
} from '../../../../utils/reader'
import {
  createWriter,
  getBytes,
  writeBytes,
  writeUint16,
  writeUint16LengthPrefixed,
} from '../../../../utils/writer'

export interface Extension {
  type: ExtensionType
  payload: Uint8Array
}

export const createExtension = (type: ExtensionType, payload: Uint8Array): Extension => ({
  type,
  payload,
})

export const marshalExtension = (extension: Extension): Uint8Array => {
  const writer = createWriter()
  writeUint16(writer, extension.type)
  writeUint16LengthPrefixed(writer, w => {
    writeBytes(w, extension.payload)
  })
  return getBytes(writer)
}

export const parseExtensions = (data: Uint8Array): Extension[] => {
  const exts: Extension[] = []
  const reader = createReader(data)

  while (!isEmpty(reader)) {
    const extType = readUint16(reader) as ExtensionType
    const payload = readUint16LengthPrefixed(reader)
    exts.push({ type: extType, payload })
  }

  return exts
}

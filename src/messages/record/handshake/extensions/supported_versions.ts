import { ExtensionType, TLSVersion } from '../../../../protocol/constants'
import {
  createReader,
  isEmpty,
  readUint8LengthPrefixed,
  readUint16,
} from '../../../../utils/reader'
import {
  createWriter,
  getBytes,
  writeUint8LengthPrefixed,
  writeUint16,
} from '../../../../utils/writer'
import { createExtension, type Extension } from './extension'

export interface SupportedVersions {
  versions: TLSVersion[]
}

export const marshalSupportedVersionsPayload = (sv: SupportedVersions): Uint8Array => {
  const writer = createWriter()
  writeUint8LengthPrefixed(writer, w => {
    for (const v of sv.versions) {
      writeUint16(w, v)
    }
  })
  return getBytes(writer)
}

export const unmarshalSupportedVersionsClient = (payload: Uint8Array): SupportedVersions => {
  const reader = createReader(payload)
  const versionList = readUint8LengthPrefixed(reader)

  if (versionList.length === 0 || versionList.length % 2 !== 0) {
    throw new Error('failed to parse supported versions')
  }

  const listReader = createReader(versionList)
  const versions: TLSVersion[] = []
  while (!isEmpty(listReader)) {
    versions.push(readUint16(listReader) as TLSVersion)
  }

  return { versions }
}

export const unmarshalSupportedVersionsServer = (payload: Uint8Array): TLSVersion => {
  if (payload.length !== 2) {
    throw new Error('failed to parse supported versions')
  }
  const reader = createReader(payload)
  return readUint16(reader) as TLSVersion
}

export const createSupportedVersionsExtension = (): Extension => {
  const sv: SupportedVersions = { versions: [TLSVersion.TLS_1_3] }
  return createExtension(ExtensionType.SupportedVersions, marshalSupportedVersionsPayload(sv))
}

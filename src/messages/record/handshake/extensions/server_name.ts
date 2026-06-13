import { ExtensionType } from '../../../../protocol/constants'
import {
  createReader,
  isEmpty,
  readUint8,
  readUint16LengthPrefixed,
} from '../../../../utils/reader'
import {
  createWriter,
  getBytes,
  writeBytes,
  writeUint8,
  writeUint16LengthPrefixed,
} from '../../../../utils/writer'
import { createExtension, type Extension } from './extension'

export interface ServerName {
  serverName: string
}

export const marshalServerNamePayload = (sn: ServerName): Uint8Array => {
  const writer = createWriter()
  writeUint16LengthPrefixed(writer, w1 => {
    // NameType: host_name (0)
    writeUint8(w1, 0)
    // HostName
    writeUint16LengthPrefixed(w1, w2 => {
      writeBytes(w2, new TextEncoder().encode(sn.serverName))
    })
  })
  return getBytes(writer)
}

export const unmarshalServerName = (payload: Uint8Array): ServerName => {
  const reader = createReader(payload)
  const nameList = readUint16LengthPrefixed(reader)
  const listReader = createReader(nameList)

  while (!isEmpty(listReader)) {
    const nameType = readUint8(listReader)
    const nameBytes = readUint16LengthPrefixed(listReader)

    if (nameType !== 0) {
      continue
    }

    const serverName = new TextDecoder().decode(nameBytes)
    if (serverName.endsWith('.')) {
      throw new Error('failed to parse server name')
    }
    return { serverName }
  }

  throw new Error('failed to parse server name')
}

export const createServerNameExtension = (servername: string): Extension => {
  const sn: ServerName = { serverName: servername }
  return createExtension(ExtensionType.ServerName, marshalServerNamePayload(sn))
}

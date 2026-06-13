import { CurveID, ExtensionType } from '../../../../protocol/constants'
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
import { createExtension, type Extension } from './extension'

export interface KeyShareEntry {
  group: CurveID
  data: Uint8Array
}

export interface KeyShareExtension {
  keyShares: KeyShareEntry[]
}

export const marshalKeySharePayload = (ksExt: KeyShareExtension): Uint8Array => {
  const writer = createWriter()
  writeUint16LengthPrefixed(writer, w1 => {
    for (const ks of ksExt.keyShares) {
      writeUint16(w1, ks.group)
      writeUint16LengthPrefixed(w1, w2 => {
        writeBytes(w2, ks.data)
      })
    }
  })
  return getBytes(writer)
}

export const unmarshalKeyShareClient = (payload: Uint8Array): KeyShareExtension => {
  const reader = createReader(payload)
  const shareList = readUint16LengthPrefixed(reader)
  const listReader = createReader(shareList)

  const keyShares: KeyShareEntry[] = []
  while (!isEmpty(listReader)) {
    const group = readUint16(listReader) as CurveID
    const data = readUint16LengthPrefixed(listReader)
    keyShares.push({ group, data })
  }

  return { keyShares }
}

export const unmarshalKeyShareServer = (
  payload: Uint8Array
): {
  share?: KeyShareEntry
  selectedGroup?: CurveID
} => {
  const reader = createReader(payload)

  if (payload.length === 2) {
    const selectedGroup = readUint16(reader) as CurveID
    return { selectedGroup }
  }

  const group = readUint16(reader) as CurveID
  const data = readUint16LengthPrefixed(reader)

  if (!isEmpty(reader)) {
    throw new Error('failed to parse key share server')
  }

  return { share: { group, data } }
}

export const createKeyShareExtension = (publicKey: Uint8Array): Extension => {
  const ksExt: KeyShareExtension = {
    keyShares: [{ group: CurveID.X25519, data: publicKey }],
  }
  return createExtension(ExtensionType.KeyShare, marshalKeySharePayload(ksExt))
}

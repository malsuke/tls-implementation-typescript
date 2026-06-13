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
  writeUint16,
  writeUint16LengthPrefixed,
} from '../../../../utils/writer'
import { createExtension, type Extension } from './extension'

export interface SupportedGroups {
  groups: CurveID[]
}

export const marshalSupportedGroupsPayload = (sg: SupportedGroups): Uint8Array => {
  const writer = createWriter()
  writeUint16LengthPrefixed(writer, w => {
    for (const g of sg.groups) {
      writeUint16(w, g)
    }
  })
  return getBytes(writer)
}

export const unmarshalSupportedGroups = (payload: Uint8Array): SupportedGroups => {
  const reader = createReader(payload)
  const curveList = readUint16LengthPrefixed(reader)

  if (curveList.length === 0 || curveList.length % 2 !== 0) {
    throw new Error('failed to parse supported groups')
  }

  const listReader = createReader(curveList)
  const groups: CurveID[] = []
  while (!isEmpty(listReader)) {
    groups.push(readUint16(listReader) as CurveID)
  }

  return { groups }
}

export const createSupportedGroupsExtension = (groups: CurveID[] = [CurveID.X25519]): Extension => {
  const sg: SupportedGroups = { groups }
  return createExtension(ExtensionType.SupportedGroups, marshalSupportedGroupsPayload(sg))
}

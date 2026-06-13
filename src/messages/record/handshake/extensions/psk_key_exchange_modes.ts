import { ExtensionType } from '../../../../protocol/constants'
import { createReader, isEmpty, readUint8, readUint8LengthPrefixed } from '../../../../utils/reader'
import {
  createWriter,
  getBytes,
  writeUint8,
  writeUint8LengthPrefixed,
} from '../../../../utils/writer'
import { createExtension, type Extension } from './extension'

export enum PSKKeyExchangeMode {
  PSKModePlain = 0,
  PSKModeDHE = 1,
}

export interface PSKKeyExchangeModes {
  modes: PSKKeyExchangeMode[]
}

export const marshalPSKKeyExchangeModesPayload = (pkm: PSKKeyExchangeModes): Uint8Array => {
  const writer = createWriter()
  writeUint8LengthPrefixed(writer, w => {
    for (const m of pkm.modes) {
      writeUint8(w, m)
    }
  })
  return getBytes(writer)
}

export const unmarshalPSKKeyExchangeModes = (payload: Uint8Array): PSKKeyExchangeModes => {
  const reader = createReader(payload)
  const modeList = readUint8LengthPrefixed(reader)

  if (modeList.length === 0) {
    throw new Error('failed to parse psk key exchange modes')
  }

  const listReader = createReader(modeList)
  const modes: PSKKeyExchangeMode[] = []
  while (!isEmpty(listReader)) {
    modes.push(readUint8(listReader) as PSKKeyExchangeMode)
  }

  return { modes }
}

export const createPSKKeyExchangeModesExtension = (
  modes: PSKKeyExchangeMode[] = [PSKKeyExchangeMode.PSKModeDHE]
): Extension => {
  const pkm: PSKKeyExchangeModes = { modes }
  return createExtension(ExtensionType.PskKeyExchangeModes, marshalPSKKeyExchangeModesPayload(pkm))
}

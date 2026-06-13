import { HandshakeType } from '../../../protocol/constants'
import { createReader, readUint8 } from '../../../utils/reader'
import { stripHandshakeHeader } from './unmarshal_helpers'

export interface KeyUpdate {
  updateRequested: boolean
}

export const marshalKeyUpdate = (ku: KeyUpdate): Uint8Array => {
  return new Uint8Array([ku.updateRequested ? 1 : 0])
}

export const unmarshalKeyUpdate = (data: Uint8Array): KeyUpdate => {
  const body = stripHandshakeHeader(data, HandshakeType.KeyUpdate)

  if (body.length !== 1) {
    throw new Error(`invalid KeyUpdate length: ${body.length}`)
  }

  const reader = createReader(body)
  const requestUpdate = readUint8(reader)

  if (requestUpdate === 0) {
    return { updateRequested: false }
  }
  if (requestUpdate === 1) {
    return { updateRequested: true }
  }
  throw new Error(`invalid KeyUpdate request value: ${requestUpdate}`)
}

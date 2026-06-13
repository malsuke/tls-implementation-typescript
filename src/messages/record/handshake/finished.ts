import { HandshakeType } from '../../../protocol/constants'
import { stripHandshakeHeader } from './unmarshal_helpers'

export interface Finished {
  verifyData: Uint8Array
}

export const marshalFinished = (finished: Finished): Uint8Array => {
  return new Uint8Array(finished.verifyData)
}

export const unmarshalFinished = (data: Uint8Array): Finished => {
  const body = stripHandshakeHeader(data, HandshakeType.Finished)
  return { verifyData: new Uint8Array(body) }
}

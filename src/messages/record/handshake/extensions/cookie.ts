import { createReader, isEmpty, readUint16LengthPrefixed } from '../../../../utils/reader'
import {
  createWriter,
  getBytes,
  writeBytes,
  writeUint16LengthPrefixed,
} from '../../../../utils/writer'

export interface Cookie {
  cookie: Uint8Array
}

export const createCookie = (cookie: Uint8Array): Cookie => ({
  cookie,
})

export const marshalCookiePayload = (cookie: Cookie): Uint8Array => {
  const writer = createWriter()
  writeUint16LengthPrefixed(writer, w => {
    writeBytes(w, cookie.cookie)
  })
  return getBytes(writer)
}

export const unmarshalCookie = (payload: Uint8Array): Cookie => {
  const reader = createReader(payload)
  const cookie = readUint16LengthPrefixed(reader)

  if (cookie.length === 0 || !isEmpty(reader)) {
    throw new Error('failed to parse cookie')
  }

  return { cookie }
}

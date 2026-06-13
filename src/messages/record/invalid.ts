export interface Invalid {
  payload: Uint8Array
}

export const parseInvalid = (data: Uint8Array): Invalid => ({
  payload: new Uint8Array(data),
})

export const marshalInvalid = (invalid: Invalid): Uint8Array => {
  return new Uint8Array(invalid.payload)
}

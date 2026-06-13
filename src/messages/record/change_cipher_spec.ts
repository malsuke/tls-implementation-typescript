export interface ChangeCipherSpec {
  type: number
}

export const parseChangeCipherSpec = (data: Uint8Array): ChangeCipherSpec => {
  if (data.length < 1) {
    throw new Error('ChangeCipherSpec message too short')
  }

  const type = data[0]

  if (type !== 1) {
    throw new Error('invalid ChangeCipherSpec type')
  }

  if (data.length > 1) {
    throw new Error('ChangeCipherSpec has trailing bytes')
  }

  return { type }
}

export const marshalChangeCipherSpec = (ccs: ChangeCipherSpec): Uint8Array => {
  return new Uint8Array([ccs.type])
}

export const createChangeCipherSpec = (): ChangeCipherSpec => ({
  type: 1,
})

export interface ApplicationData {
  data: Uint8Array
}

export const parseApplicationData = (data: Uint8Array): ApplicationData => ({
  data: new Uint8Array(data),
})

export const marshalApplicationData = (ad: ApplicationData): Uint8Array => {
  return new Uint8Array(ad.data)
}

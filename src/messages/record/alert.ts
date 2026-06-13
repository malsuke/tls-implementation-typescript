import { type AlertDescription, AlertLevel } from '../../protocol/constants'
import { createReader, isEmpty, readUint8 } from '../../utils/reader'
import { createWriter, getBytes, writeUint8 } from '../../utils/writer'

export interface Alert {
  level: AlertLevel
  description: AlertDescription
}

export const parseAlert = (data: Uint8Array): Alert => {
  const reader = createReader(data)
  const level = readUint8(reader) as AlertLevel
  const description = readUint8(reader) as AlertDescription

  if (!isEmpty(reader)) {
    throw new Error('Alert has trailing bytes')
  }

  return { level, description }
}

export const marshalAlert = (alert: Alert): Uint8Array => {
  const writer = createWriter()
  writeUint8(writer, alert.level)
  writeUint8(writer, alert.description)
  return getBytes(writer)
}

export const createWarningAlert = (description: AlertDescription): Alert => ({
  level: AlertLevel.Warning,
  description,
})

export const createFatalAlert = (description: AlertDescription): Alert => ({
  level: AlertLevel.Fatal,
  description,
})

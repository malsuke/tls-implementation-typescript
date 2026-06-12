import { type AlertDescription, AlertLevel } from '../../protocol/constants'
import { Reader } from '../../utils/reader'
import { Writer } from '../../utils/writer'

export class Alert {
  constructor(
    public level: AlertLevel,
    public description: AlertDescription
  ) {}

  public static parse(data: Uint8Array): Alert {
    const reader = new Reader(data)
    const level = reader.readUint8() as AlertLevel
    const description = reader.readUint8() as AlertDescription

    if (!reader.isEmpty) {
      throw new Error('Alert has trailing bytes')
    }

    return new Alert(level, description)
  }

  public marshal(): Uint8Array {
    const writer = new Writer()
    writer.writeUint8(this.level)
    writer.writeUint8(this.description)
    return writer.bytes()
  }

  public static newWarningAlert(desc: AlertDescription): Alert {
    return new Alert(AlertLevel.Warning, desc)
  }

  public static newFatalAlert(desc: AlertDescription): Alert {
    return new Alert(AlertLevel.Fatal, desc)
  }
}

import {
  ContentType,
  HandshakeType,
  TLSPlaintext,
  Handshake,
  ClientHello,
} from "../src/index";

// Helper function to convert a hex string to a Uint8Array
function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// A sample raw hex dump of a TLS 1.3 ClientHello record
const clientHelloHex =
  "16030100840100008003030000000000000000000000000000000000000000000000000000000000000000000002130101000055002b0003020304000a00040002001d000d00040002080700000010000e00000b6578616d706c652e636f6d003300260024001d002094ecf4e99d5e8931fc31c26937714320061de919e69b39cd15330d592702c956";
const rawData = hexToUint8Array(clientHelloHex);

console.log("--- TLS 1.3 ClientHello Parsing Example ---");
console.log(`Raw data length: ${rawData.length} bytes\n`);

try {
  // 1. Parse the TLS Record
  const record = TLSPlaintext.parse(rawData);
  console.log("1. Record Layer parsed:");
  console.log(
    `   Type: ${ContentType[record.type]} (0x${record.type.toString(16).padStart(2, "0")})`,
  );
  console.log(`   Version: 0x${record.version.toString(16).padStart(4, "0")}`);
  console.log(`   Payload Length: ${record.length} bytes\n`);

  if (record.type === ContentType.Handshake) {
    // 2. Parse the Handshake message from the Record payload
    const handshake = Handshake.parse(record.payload);
    console.log("2. Handshake Layer parsed:");
    console.log(
      `   Type: ${HandshakeType[handshake.handshakeType]} (0x${handshake.handshakeType.toString(16).padStart(2, "0")})`,
    );
    console.log(`   Length: ${handshake.length} bytes\n`);

    if (handshake.handshakeType === HandshakeType.ClientHello) {
      // 3. Parse the specific ClientHello message
      const clientHello = ClientHello.unmarshal(handshake.body);
      console.log("3. ClientHello Message parsed:");
      console.log(
        `   Protocol Version: 0x${clientHello.protocolVersion.toString(16).padStart(4, "0")}`,
      );

      console.log(clientHello.extensions[0].type);

      console.log(
        `   Random: ${Buffer.from(clientHello.random).toString("hex")}`,
      );

      console.log(`   Cipher Suites Count: ${clientHello.cipherSuites.length}`);
    }
  }
} catch (error) {
  console.error("Error parsing TLS message:", error);
}

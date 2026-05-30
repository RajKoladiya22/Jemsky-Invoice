import QRCode from "qrcode";

/**
 * Generates a Base64 data URL for a UPI payment QR Code.
 */
export async function generateUPIQRCode(
  upiId: string,
  merchantName: string,
  amount: number,
  currency = "INR",
  invoiceNumber = ""
): Promise<string> {
  if (!upiId) return "";
  
  // Clean values
  const cleanUpi = upiId.trim();
  const cleanName = merchantName.trim();
  const amtStr = amount.toFixed(2);
  
  // Standard UPI deep link format
  const upiLink = `upi://pay?pa=${encodeURIComponent(cleanUpi)}&pn=${encodeURIComponent(cleanName)}&am=${amtStr}&cu=${currency}&tn=${encodeURIComponent(invoiceNumber)}`;
  
  try {
    return await QRCode.toDataURL(upiLink, {
      margin: 1,
      width: 200,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    });
  } catch (err) {
    console.error("Error generating UPI QR code:", err);
    return "";
  }
}

/**
 * Generates a simple text/URL QR code (e.g. for website or contact verification).
 */
export async function generateTextQRCode(text: string): Promise<string> {
  if (!text) return "";
  try {
    return await QRCode.toDataURL(text, {
      margin: 1,
      width: 200,
    });
  } catch (err) {
    console.error("Error generating general QR code:", err);
    return "";
  }
}

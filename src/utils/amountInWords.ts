/**
 * amountInWords.ts
 * Converts a number to Indian Rupee words (up to 99,99,99,999)
 * Example: 418352 → "Four Lakh Eighteen Thousand Three Hundred Fifty Two Rupees Only"
 */

const ones = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const tens = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function twoDigits(n: number): string {
  if (n < 20) return ones[n];
  return (tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "")).trim();
}

function threeDigits(n: number): string {
  if (n === 0) return "";
  if (n < 100) return twoDigits(n);
  return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + twoDigits(n % 100) : "");
}

export function numberToIndianWords(amount: number): string {
  if (isNaN(amount) || amount < 0) return "Invalid Amount";

  const intPart = Math.floor(amount);
  const decimalPart = Math.round((amount - intPart) * 100);

  if (intPart === 0 && decimalPart === 0) return "Zero Rupees Only";

  const crore = Math.floor(intPart / 10000000);
  const lakh  = Math.floor((intPart % 10000000) / 100000);
  const thousand = Math.floor((intPart % 100000) / 1000);
  const hundred  = intPart % 1000;

  const parts: string[] = [];
  if (crore > 0)   parts.push(threeDigits(crore)   + " Crore");
  if (lakh > 0)    parts.push(threeDigits(lakh)     + " Lakh");
  if (thousand > 0) parts.push(threeDigits(thousand) + " Thousand");
  if (hundred > 0)  parts.push(threeDigits(hundred));

  let result = parts.join(" ") + " Rupee" + (intPart !== 1 ? "s" : "");

  if (decimalPart > 0) {
    result += " and " + twoDigits(decimalPart) + " Paise";
  }

  return result + " Only";
}

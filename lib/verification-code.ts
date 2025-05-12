/**
 * Generates a random verification code of specified length
 */
export function generateVerificationCode(length = 6): string {
  // Generate a random numeric code
  let code = ""
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10).toString()
  }
  return code
}
/**
 * Validates a verification code against the expected code
 */
export function validateVerificationCode(inputCode: string, expectedCode: string): boolean {
  return inputCode === expectedCode
}

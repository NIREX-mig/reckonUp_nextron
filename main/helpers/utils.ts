// secret for json web token
export const tempSecret = "sdkfjasdkjfsifuoewfosadhfksdjfdjfdskjfue0iweu09230";

export function genrateOtp(length: number) {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

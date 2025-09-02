import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { envConfig } from 'src/core/config/env.config';

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export const generateAccessToken = (data: any) => {
  const { _id } = data;
  return jwt.sign({ ...data, _id }, envConfig.jwt.secret, {
    expiresIn: envConfig.jwt.expiry as any,
  });
};

export const verifyJWT = (token: string, key: string): any | boolean => {
  try {
    const resp: any = jwt.verify(token, key);
    return resp;
  } catch {
    return false;
  }
};

export const RandomSixDigits = (): string => {
  let result = '';
  for (let i = 0; i < 6; i++) {
    const randomNum = Math.floor(Math.random() * 10); // Generate a random integer between 0 and 9
    result += randomNum;
  }

  if (result[0] === '0') {
    // Check if the first digit is zero
    result = '1' + result.slice(1); // Replace the first digit with 1
  }

  return result;
};

export const AlphaNumeric = (
  length: number,
  type: string = 'alpha',
): string => {
  var result: string = '';
  var characters: string =
    type === 'alpha'
      ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      : '0123456789';

  var charactersLength: number = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

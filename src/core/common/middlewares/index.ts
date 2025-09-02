import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { envConfig } from 'src/core/config/env.config';

export const verifyTokens = ({
  secret,
  token,
}: {
  secret: string;
  token: string;
}) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, function (err: Error, decoded: any) {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

interface CustomRequest extends Request {
  user?: { _id: string; accountType: string };
}

@Injectable()
export class VerifyTokenMiddleware implements NestMiddleware {
  use(req: CustomRequest, res: Response, next: NextFunction) {
    let accessToken = req.headers.authorization;
    if (accessToken) accessToken = accessToken.split(' ')[1] as string;

    verifyTokens({ token: accessToken, secret: envConfig.jwt.secret as string })
      .then((decoded) => {
        const user = {
          _id: decoded['_id'],
          accountType: decoded['accountType'],
        };
        req.user = user;
        next();
      })
      .catch((error) => {
        console.error('Token Verification Failed:', error);
        res
          .status(401)
          .json({ message: 'Your access token is either expired or invalid' });
      });
  }
}

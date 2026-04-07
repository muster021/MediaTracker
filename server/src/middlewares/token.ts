import { NextFunction, Request, Response } from 'express';
import { createHash } from 'crypto';
import { accessTokenRepository } from 'src/repository/accessToken';

export class AccessTokenMiddleware {
  static async authorize(req: Request, res: Response, next: NextFunction) {
    let token: string | undefined;

    // Check for token in Authorization header
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }

    // HTTP Basic Auth — HA Remote Calendar uses this format
    // URL: http://mediatracker:TOKEN@host:7481/api/calendar.ics
    // HA sends: Authorization: Basic base64(mediatracker:TOKEN)
    if (!token && authHeader && authHeader.startsWith('Basic ')) {
      const decoded = Buffer.from(authHeader.substring(6), 'base64').toString('utf8');
      const colonIdx = decoded.indexOf(':');
      if (colonIdx !== -1) {
        token = decoded.substring(colonIdx + 1); // password = token
      }
    }

    // If not found in Authorization header, check Access-Token header
    if (!token) {
      token = req.header('Access-Token');
    }

    // If still not found, check query parameter
    if (!token && typeof req.query.token === 'string') {
      token = req.query.token;
    }

    if (!token) {
      next();
      return;
    }

    const hashedToken = createHash('sha256')
      .update(token, 'utf-8')
      .digest('hex');

    const accessToken = await accessTokenRepository.findOne({
      token: hashedToken,
    });

    if (!accessToken) {
      next();
      return;
    }

    req.user = accessToken.userId;

    next();
  }
}

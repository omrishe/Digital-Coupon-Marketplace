declare global {
  namespace Express {
    interface Request {
      admin?: { id: string; username: string };
      reseller?: import('@repo/shared').ResellerJwtPayload;
      user?: import('../entities/User').User;
    }
  }
}

export {};

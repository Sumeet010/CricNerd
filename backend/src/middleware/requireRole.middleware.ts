import { Request, Response, NextFunction } from "express";
import { ROLE } from "../constants/roles.constant";

export function requireRole(roles: typeof ROLE[number][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRoles = (req as any).role || [];

    const hasAccess = roles.some((role) =>
      userRoles.includes(role)
    );

    if (!hasAccess) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    next();
  };
}
import "server-only";
import jwt from "jsonwebtoken";

const EMPLOYEE_JWT_SECRET = process.env.EMPLOYEE_JWT_SECRET!;
const EMPLOYEE_TOKEN_TTL = "15m";

export type EmployeeJwtPayload = {
  userId: number;
  roleId: number;
};

export function signEmployeeToken(payload: EmployeeJwtPayload) {
  return jwt.sign(payload, EMPLOYEE_JWT_SECRET, { expiresIn: EMPLOYEE_TOKEN_TTL });
}

export function verifyEmployeeToken(token: string): EmployeeJwtPayload | null {
  try {
    return jwt.verify(token, EMPLOYEE_JWT_SECRET) as EmployeeJwtPayload;
  } catch {
    return null;
  }
}

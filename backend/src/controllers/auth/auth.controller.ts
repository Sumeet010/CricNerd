import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { registerSchema, loginSchema } from "./auth.schema";
import { User } from "../../models/user.model";

const JWT_SECRET = process.env.JWT_SECRET || "cricnerd-default-secret";
const JWT_EXPIRES_IN = "7d";

export function generateToken(userId: string, role: string[]) {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function setTokenCookie(res: Response, token: string) {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}


// POST /auth/register
export async function registerHandler(req: Request, res: Response) {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        error: result.error,
      });
    }

    const { email, username, password, role } = result.data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already in use, try another email",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      passwordHashed,
      name: username,
      role
    });

    const token = generateToken(user._id.toString(), user.role);
    setTokenCookie(res, token);

    return res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
        role: user.role
      },
      token,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// POST /auth/login
export async function loginHandler(req: Request, res: Response) {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        error: result.error,
      });
    }

    const { email, password } = result.data;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHashed);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id.toString(), user.role);
    setTokenCookie(res, token);

    return res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
      },
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// POST /auth/logout
export async function logoutHandler(req: Request, res: Response) {
  try {
    res.clearCookie("token");
    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// GET /auth/me  (protected)
export async function getMeHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const user = await User.findById(userId).select("-passwordHashed").lean();

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
      message: "User fetched successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

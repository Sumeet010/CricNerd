import { z } from "zod";
import { ROLE } from "../../constants/roles.constant";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^A-Za-z0-9]/, "Must contain special character")
    .trim(),
  username: z
    .string()
    .min(2, { message: "Username must be at least 2 characters" })
    .trim(),
  role: z
    .array(z.enum(ROLE))
    .optional()
    .default([ROLE[0]])
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, { message: "Password is required" }),
});
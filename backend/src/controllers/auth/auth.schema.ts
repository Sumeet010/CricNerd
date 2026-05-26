import { z } from "zod";
import { ROLE } from "../../constants/roles.constant";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  username: z
    .string()
    .min(2, { message: "Username must be at least 2 characters" })
    .trim(),
  role: z
    .array(z.enum(ROLE))
    .default([ROLE[0]])

});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, { message: "Password is required" }),
});
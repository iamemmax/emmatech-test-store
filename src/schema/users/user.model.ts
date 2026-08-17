import mongoose, { Document } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export type Role = "admin" | "super-admin" | "user";

export interface IUserDocument extends Document {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  roles: Role[];
  phone_number?: string;
  /** Hash of the currently-active refresh token, if any (see setRefreshToken). */
  token?: string;
  tokenExpiresAt?: Date;
  verified: boolean;

  matchPassword(entered: string): Promise<boolean>;
  setRefreshToken(token: string, expiresAt: Date): void;
  matchRefreshToken(token: string): boolean;
  clearRefreshToken(): void;
}

const userSchema = new mongoose.Schema<IUserDocument>(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
    },

    last_name: {
      type: String,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      trim: true,
      select: false,
    },

    roles: {
      type: [String],
      enum: ["admin", "super-admin", "user"],
      default: ["user"],
    },

    phone_number: {
      type: String,
      trim: true,
    },

    token: {
      type: String,
      select: false,
    },

    tokenExpiresAt: {
      type: Date,
      select: false,
    },

    verified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = function (
  entered: string
): Promise<boolean> {
  return bcrypt.compare(entered, this.password!);
};

const hashRefreshToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

/** Stores a hash of `token` (never the raw token) plus its expiry, replacing any previous one. */
userSchema.methods.setRefreshToken = function (
  token: string,
  expiresAt: Date
): void {
  this.token = hashRefreshToken(token);
  this.tokenExpiresAt = expiresAt;
};

/** Timing-safe check of a presented refresh token against the stored hash. */
userSchema.methods.matchRefreshToken = function (token: string): boolean {
  if (!this.token) return false;

  const stored = Buffer.from(this.token);
  const provided = Buffer.from(hashRefreshToken(token));

  return (
    stored.length === provided.length &&
    crypto.timingSafeEqual(stored, provided)
  );
};

/** Revokes the current refresh token (logout, reuse detection). */
userSchema.methods.clearRefreshToken = function (): void {
  this.token = undefined;
  this.tokenExpiresAt = undefined;
};

const UserModel = mongoose.model<IUserDocument>("users", userSchema);

export default UserModel;
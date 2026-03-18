import * as mongoose from "mongoose";
import { Schema } from "mongoose";
import * as bcrypt from "bcryptjs";
import { IUser } from "../models/user-model";
import { FirebaseTokenSchema } from "./sub-schema/firebase-token-schema";

const jwt = require("jsonwebtoken");

export const UserSchemaOptions: mongoose.SchemaOptions = {
  _id: true,
  id: false,
  timestamps: true,
  skipVersioning: { key: true },
  strict: false,
  discriminatorKey: "role",
  toJSON: {
    getters: true,
    virtuals: true,
    transform: (doc, ret: any) => {
      delete ret.password_hash;
    },
  },
};

export const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: Schema.Types.String,
      required: true,
    },
    username: {
      type: Schema.Types.String,
      required: true,
    },
    password_hash: {
      type: Schema.Types.String,
      required: true,
    },
    role: {
      type: Schema.Types.String,
      required: true,
    },
    email: {
      type: Schema.Types.String,
      required: true,
    },
    mobile_number: {
      type: Schema.Types.String,
      require: false,
    },
    area: {
      type: Schema.Types.String,
      require: false,
    },
    address: {
      type: Schema.Types.String,
      required: false,
    },
    is_active: {
      type: Schema.Types.Boolean,
      require: true,
    },
  },
  UserSchemaOptions
);

userSchema.pre("save", function (next) {
  const user: any = this;

  if (!user.isModified("password_hash")) return next();
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password_hash, salt, function (err, hash) {
      if (err) return next(err);

      user.password_hash = hash;
      next();
    });
  });
});

// @ts-ignore
userSchema.methods.createAccessToken = function (this: IUser) {
  return jwt.sign({ user_id: this._id }, process.env.JWT_SECRET);
};

userSchema.methods.comparePassword = function (
  password_hash: any
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // noinspection JSIgnoredPromiseFromCall
    // @ts-ignore
    bcrypt.compare(password_hash, this.password_hash, function (err, isMatch) {
      if (err) {
        return reject(err);
      }
      return resolve(isMatch);
    });
  });
};


userSchema.methods.compareVerificationCode = function (verificationCode: any): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // noinspection JSIgnoredPromiseFromCall
    // @ts-ignore
    bcrypt.compare(verificationCode, this.verificationCode, function (err, isMatch) {
      if (err) {
        return reject(err);
      }

      return resolve(isMatch);
    });
  });
};


const User = mongoose.model<IUser>("User", userSchema);
export default User;

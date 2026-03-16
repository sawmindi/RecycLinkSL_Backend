import { check } from "express-validator";
import { UserRole } from "../models/user-model";
import { Types } from "mongoose";

export const Validation = {
  email: () =>
    check("email")
      .not()
      .isEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false })
      .withMessage("Invalid email address and please try again."),
  phone: () =>
    check("phoneNumber")
      .optional()
      .isString()
      .withMessage("Phone number must be string!")
      .not()
      .isEmpty()
      .withMessage("Phone number is required!"),
  password: () =>
    check("password")
      .isString()
      .not()
      .isEmpty()
      .withMessage("Password is required.")
      .isLength({ min: 6, max: 40 })
      .withMessage(
        "Password must be at least 6 chars long & not more than 40 chars long."
      )
      .not()
      .isIn(["123", "password", "god", "abc"])
      .withMessage("Do not use a common word as the password")
      .matches(/\d/)
      .withMessage("Password must contain a number."),
  oldPassword: () =>
    check("oldPassword")
      .isString()
      .not()
      .isEmpty()
      .withMessage("Password is required.")
      .isLength({ min: 6, max: 40 })
      .withMessage(
        "Password must be at least 6 chars long & not more than 40 chars long."
      )
      .not()
      .isIn(["123", "password", "god", "abc"])
      .withMessage("Do not use a common word as the password")
      .matches(/\d/)
      .withMessage("Password must contain a number."),
  role: (...roles: UserRole[]) =>
    check("role")
      .not()
      .isEmpty()
      .withMessage("User Role is required.")
      .isIn(roles)
      .withMessage("User role has to be either a CLIENT or a THERAPIST"),
  noPermissions: () => check("permissions").not().exists(),
  name: () =>
    check("name")
      .not()
      .isEmpty()
      .withMessage("Name is required.")
      .isString()
      .isLength({ max: 1000 })
      .withMessage("Name field should not be more than 1000 chars long."),
  objectId: (key: string = "_id") =>
    check(key)
      .not()
      .isEmpty()
      .withMessage(`${key} cannot be empty`)
      .custom((v) => isObjectId(v))
      .withMessage(`${key} is not a valid mongoDb objectID`),
  upload: (key: string = "upload") =>
    check()
      .not()
      .isEmpty()
      .withMessage(`${key} cannot be empty`)
      .custom((v) => isObjectId(v))
      .withMessage(`${key} is invalid`),
  uploads: (key: string = "uploads") =>
    check(`${key}.*._id`)
      .not()
      .isEmpty()
      .withMessage(`${key} objects cannot be empty`)
      .custom((v) => isObjectId(v))
      .withMessage(`${key} objects are invalid`),
};

export function isObjectId(v: string): boolean {
  return Types.ObjectId.isValid(v) && new Types.ObjectId(v).toHexString() === v;
}

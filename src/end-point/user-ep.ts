import { NextFunction, Request, Response } from "express";
import { UserDao } from "../dao/user-dao";
import { validationResult } from "express-validator";
import { UserRole } from "../models/user-model";
import multer = require("multer");
import { Validation } from "../common/validation";
import { Util } from "../common/util";
import { Types } from "mongoose";
import { AppLogger } from "../common/logging";

const otpGenerator = require("otp-generator");
const crypto = require("crypto");
require("dotenv").config();
export namespace UserEp {
    export function loginWithPhoneValidationRules() {
        return [Validation.phone(), Validation.password()];
    }
    export function signUpValidationRules() {
        return [Validation.phone(), Validation.password()];
    }
    export async function loginWithPhoneNumber(req: Request, res: Response, next: NextFunction) {
        const phoneNumber = req.body.phoneNumber;
        const password = req.body.password;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.sendError(errors.array()[0]["msg"]);
        }
        try {
            let user = await UserDao.getUserByPhoneNumber(phoneNumber);
            if (user) {
                let isMatch;

                if (user.password_hash) {
                    isMatch = await user.comparePassword(password);
                } else {
                    return res.sendError("You have signed up to this account using social login. Please check.");
                }

                if (isMatch) {
                    let authToken = user.createAccessToken();

                    res.cookie("token", authToken, {
                        httpOnly: true,
                        secure: false,
                        maxAge: 24 * 60 * 60 * 1000,
                    });

                    return res.sendSuccess(authToken, "Successfully Logged.");

                } else {
                    return res.sendError("Incorrect email/password combination.");
                }
            } else {
                return res.sendError("User not found.");
            }
        } catch (error) {
            return res.sendError(error);
        }
    }

    export async function getMe(req: Request, res: Response, next: NextFunction) {
        let user = await UserDao.getUserById(req.user._id);

        if (!user) {
            return res.sendError("User not found.");
        }

        return res.sendSuccess(user, "Success");
    }

    export async function signUpAsCitizen(req: Request, res: Response, next: NextFunction) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.sendError(errors.array()[0]["msg"]);
        }

        const full_name = req.body.full_name;
        const username = req.body.username;
        const email = req.body.email;
        const mobile_number = req.body.phoneNumber || req.body.mobile_number;
        const area = req.body.area;
        const address = req.body.address;
        const password_hash = req.body.password;
        const is_active = false;
        const role = UserRole.CITIZEN;
        let user = null;
        let verificationCode = null;

        try {
            const existingUser = await UserDao.getUserByPhoneNumber(mobile_number);

            if (existingUser) {
                return res.sendError("Provided phone number is already taken.");
            }

            user = await UserDao.signUpWithPhoneNumber(
                full_name,
                username,
                mobile_number,
                email,
                area,
                address || "",
                role,
                password_hash,
                is_active
            );
            let code = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
            console.log(code)

            verificationCode = code.toString();

            const updatedUser: any = {
                verificationCode: await Util.passwordHashing(verificationCode),
            };

            let userWithVerificationCode = await UserDao.updateUser(user._id as any, updatedUser);

            if (!userWithVerificationCode) {
                return res.sendError("Something went wrong with verification code.");
            }

            return res.sendSuccess(user, "Success");

        } catch (error) {
            return res.sendError(error);
        }
    }

    export function collectorSignUpValidationRules() {
        return [Validation.phone(), Validation.password()];
    }

    export async function collectorSignUp(req: Request, res: Response, next: NextFunction) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.sendError(errors.array()[0]["msg"]);
        }

        const full_name = req.body.full_name;
        const username = req.body.username;
        const email = req.body.email;
        const mobile_number = req.body.phoneNumber || req.body.mobile_number;
        const area = req.body.area;
        const address = req.body.address;
        const password_hash = req.body.password;
        const is_active = req.body.is_active ?? true;

        try {
            const existingUser = await UserDao.getUserByPhoneNumber(mobile_number);

            if (existingUser) {
                return res.sendError("Provided phone number is already taken.");
            }

            const user = await UserDao.signUpWithPhoneNumber(
                full_name,
                username,
                mobile_number,
                email,
                area,
                address || "",
                UserRole.COLLECTOR,
                password_hash,
                is_active
            );

            return res.sendSuccess(user, "Collector created successfully.");
        } catch (error) {
            return res.sendError(error);
        }
    }

    export async function verifyUserByCode(req: Request, res: Response, next: NextFunction) {
        const verificationCode = req.body.verificationCode;
        const userId = req.body.userId;
        try {
            const user = await UserDao.getUserById(userId);
            const isMatch = await user.compareVerificationCode(verificationCode);
            if (isMatch) {
                try {
                    const updatedUser = await UserDao.updateUser(
                        new Types.ObjectId(userId),
                        { is_active: true }
                    );

                    if (!updatedUser) {
                        return res.sendError("Something went wrong! Please try again later.");
                    }

                    const authToken = updatedUser.createAccessToken();

                    res.cookie("token", authToken, {
                        httpOnly: true,
                        secure: false,
                        maxAge: 24 * 60 * 60 * 1000,
                    });

                    return res.sendSuccess(authToken, "Successfully Logged.");
                } catch (error) {
                    return res.sendError(error);
                }
            } else {
                return res.sendError("Invalid verification code.");
            }
        } catch (error) {
            return res.sendError(error);
        }
    }

    export async function sendForgotPassword(req: Request, res: Response) {
        const errors = validationResult(req);
        let { phoneNumber } = req.body;

        if (!errors.isEmpty()) {
            return res.sendError(errors.array()[0]["msg"]);
        }

        try {
            let existingUser = await UserDao.getUserByPhoneNumber(phoneNumber);
            if (!existingUser) {
                AppLogger.error(
                    `.::User not found for the provided phone number.` + phoneNumber
                );
                return res.sendError(
                    "User not found for the provided or phone number."
                );
            }

            const otp = otpGenerator.generate(6, {
                digits: true,
                upperCaseAlphabets: false,
                specialChars: false,
                lowerCaseAlphabets: false,
            });

            const ttl = 5 * 60 * 1000;
            const expires = Date.now() + ttl;
            let otpSent;

            if (phoneNumber != "") {
                const data = `${phoneNumber}.${otp}.${expires}`;
                const hash = crypto
                    .createHmac("sha256", process.env.OTP_SECRET_KEY)
                    .update(data)
                    .digest("hex");
                const fullHash = `${hash}.${expires}`;

                if (phoneNumber.startsWith("0")) {
                    phoneNumber = "94" + phoneNumber.substring(1);
                }
                console.log(otp)

                let text: string;
                text = `Your OTP code is ${otp}. Do not share this code.`;
                const data1 = {
                    otp: otp,
                    fullHash: fullHash
                }
                return res.sendSuccess(data1, "OTPGENERATED");
            }
        } catch (error) {
            return res.sendError(error);
        }
    }

    export async function otpVerificationForgotPassword(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        let phoneNumber = req.body.phoneNumber;
        const password = req.body.password;
        const hash = req.body.otpHash;
        const otp = req.body.otpCode;
        let existingUser: any;

        try {
            let [hashValue, expires] = hash.split(".");
            let now = Date.now();
            if (now > parseInt(expires))
                return res.sendError("" + "OTP expired. Please try again.");
            let dataEmail = `${phoneNumber}.${otp}.${expires}`;
            let newCalculatedHash = crypto
                .createHmac("sha256", process.env.OTP_SECRET_KEY)
                .update(dataEmail)
                .digest("hex");

            if (newCalculatedHash === hashValue) {
                existingUser = await UserDao.getUserByPhoneNumber(phoneNumber);
                if (!existingUser) {
                    AppLogger.error(
                        `.::User not found for the provided phone. ${phoneNumber}`
                    );
                    return res.sendError(
                        "User not found for the provided phone."
                    );
                }
                const newPassword = await Util.passwordHashing(password);

                const updatedUser = await UserDao.updateUser(
                    new Types.ObjectId(existingUser._id),
                    {
                        password_hash: newPassword,
                    }
                );
                if (!updatedUser) {
                    AppLogger.error(
                        `.::Something went wrong while changing the password. Please try again later. ${phoneNumber}`
                    );
                    return res.sendError(
                        "Something went wrong while changing the password. Please try again later."
                    );
                }
                AppLogger.info(`.::Password changed. ${phoneNumber} `);
                const data = {
                    phoneNumber: phoneNumber,
                };
                return res.sendSuccess(data, "Password changed.");
            }
            return res.sendError("" + "Invalid OTP please try again");
        } catch (error) {
            return res.sendError(error + " ");
        }
    }

}

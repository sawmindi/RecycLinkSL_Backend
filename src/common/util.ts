import { NextFunction, Request, Response } from "express";
import * as mongoose from "mongoose";
import * as bcrypt from "bcryptjs";
import { Types } from "mongoose";
import * as fs from "fs";

const jwksClient = require("jwks-rsa");
const jwt = require("jsonwebtoken");

export type ObjectIdOr<T extends mongoose.Document> = mongoose.Types.ObjectId | T;

export type StringOrObjectId = string | mongoose.Types.ObjectId;

export namespace Util {
  export function withErrorHandling(requestHandler: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
    return function updateProject(req: Request, res: Response, next: NextFunction) {
      requestHandler(req, res, next).catch(next);
    };
  }

  export async function passwordHashing(password: string): Promise<any> {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }

  export async function getLastDayOfMonth(year: number, month: number): Promise<any> {
    return new Date(year, month + 1, 0).getDate();
  }

  export function isObjectId(v: string): boolean {
    return mongoose.Types.ObjectId.isValid(v) && new Types.ObjectId(v).toHexString() === v;
  }

  export async function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }



  export function verifyJWT(json: any, publicKey: string) {
    return new Promise((resolve) => {
      jwt.verify(json, publicKey, (error: any, payload: any) => {
        if (error) {
          return resolve(null);
        } else {
          resolve(payload);
        }
      });
    });
  }

  export function textCenter(source: string, length: number, char = " "): string {
    const spaces = length - source.length;
    const padLeft = spaces / 2 + source.length;
    return source.padStart(padLeft, char).padEnd(length, char);
  }

  export function base64Encode(file: string): string {
    const bitmap = fs.readFileSync(file);
    return Buffer.from(bitmap).toString("base64");
  }

  export function extractDate(createdAt: string): string {
    const dateObj = new Date(createdAt);
    return dateObj.toISOString().split("T")[0];
  }


  export function formatNumber(number: number) {
    const formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number);

    return formattedNumber;
  }
}

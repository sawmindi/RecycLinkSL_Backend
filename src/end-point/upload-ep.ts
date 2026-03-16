import { Request, Response } from "express";
import { UploadDao } from "../dao/upload-dao";
import * as fs from "fs";
const sharp = require("sharp");

export namespace UploadEp {
  export async function getImageFromId(req: Request, res: Response) {
    const imageId = req.params.imageId;
    const upload = await UploadDao.getUpload(imageId);

    try {
      if (fs.existsSync(upload.path)) {
        return fs.createReadStream(upload.path)
          .pipe(sharp().jpeg()).pipe(res);
      } else {
        return fs.createReadStream("./uploads/logo.jpg").pipe(res);
      }
    } catch (error) {
      throw error;
    }
  }
}

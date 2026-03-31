import { DUpload, IUpload } from "../models/upload-model";
import Upload from "../schemas/upload-schema";
import { AppLogger } from "../common/logging";
import { StringOrObjectId } from "../common/util";

export namespace UploadDao {
  export async function createUpload(data: DUpload): Promise<IUpload> {
    const iUpload: IUpload = new Upload(data);
    AppLogger.info(`Created Upload ID: ${iUpload._id}`);
    return await iUpload.save();
  }

  export async function getUpload(uploadId: string) {
    try {
      const upload = await Upload.findById(uploadId);
      AppLogger.info(`Get upload for id ${uploadId}`);
      return upload;
    } catch (error) {
      AppLogger.info(`getUpload: ${error}`);
    }

  }

  export async function deleteUploadById(uploadId: StringOrObjectId) {
    Upload.findOneAndDelete({ _id: uploadId })
      .then((docs) => {
        if (docs) {
          return uploadId;
        } else {
          AppLogger.info("Upload ID not found");
        }
      })
      .catch((err) => {
        AppLogger.info(err);
      });
    AppLogger.info(`Got Delete for ID: ${uploadId}`);
  }
}

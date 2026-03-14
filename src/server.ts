/// <reference path="global.d.ts" />
require("dotenv").config();

import * as express from "express";
import * as fs from "fs";
import * as https from "https";
import * as morgan from "morgan";
import * as routes from "./routes";
import { RequestLoggerHandler } from "./middleware/request-logger";
import { handleError } from "./middleware/error-handler";
import { Authentication } from "./middleware/authentication";
import { AppLogger } from "./common/logging";
import databaseSetup from "./startup/database";
import passportStartup from "./startup/passport";
import * as cors from "cors";
import * as http from "http";
import { ResponseHandler } from "./middleware/response-handler";

const production = process.env.NODE_ENV === "production";
const PORT: any = process.env.PORT || 4000;

// No inspection JSIgnoredPromiseFromCall
databaseSetup();

const app = express();
app.use(RequestLoggerHandler);
app.use(ResponseHandler);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// noinspection JSIgnoredPromiseFromCall
passportStartup(app);
app.use(morgan("combined"));

if (!production) {
  app.use(
    cors({
      optionsSuccessStatus: 200,
      origin: "*",
      allowedHeaders: [
        "Content-Type, Access-Control-Allow-Headers, Access-Control-Allow-Origin, Authorization, X-Requested-With",
        "Cache-Control",
      ],
    })
  );
}

app.use("/api/auth", Authentication.verifyToken);

let server;

if (production) {
  server = https.createServer(
    {
      key: fs.readFileSync(process.env.SERVER_KEY_PATH || "server.key"),
      cert: fs.readFileSync(process.env.SERVER_CERT_PATH || "server.cert"),
    },
    app
  );
} else {
  server = new http.Server(app);
}

server.listen(PORT, () => {
  AppLogger.info("--> HTTPS Server successfully started at port " + PORT);
});

routes.initRoutes(app);
app.use(handleError);

export default app;

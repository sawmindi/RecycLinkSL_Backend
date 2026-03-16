import { Express, Request, Response } from "express";
import { initAdminRoutes } from "./admin";
import { initUserRoutes } from "./user";

export function initRoutes(app: Express) {
  /* TOP LEVEL */
  app.get("/api", (req: Request, res: Response) =>
    res.sendSuccess("ECommerce™ Api", "Success")
  );

  initAdminRoutes(app);
  initUserRoutes(app);
  /* ALL INVALID REQUESTS */
  app.get("/", (req: Request, res: Response) => res.redirect(301, "/api"));
  app.all("*", (req: Request, res: Response) =>
    res.sendError("Route Not Found")
  );
}

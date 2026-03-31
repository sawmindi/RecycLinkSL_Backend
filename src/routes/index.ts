import { Express, Request, Response } from "express";
import { initAdminRoutes } from "./admin";
import { initAdminPanelRoutes } from "./admin-panel";
import { initUserRoutes } from "./user";

export function initRoutes(app: Express) {

  app.get("/api", (req: Request, res: Response) =>
    res.sendSuccess("ECommerce™ Api", "Success")
  );

  initAdminRoutes(app);
  initAdminPanelRoutes(app);
  initUserRoutes(app);
  
  app.get("/", (req: Request, res: Response) => res.redirect(301, "/api"));
  app.all("*", (req: Request, res: Response) =>
    res.sendError("Route Not Found")
  );
}

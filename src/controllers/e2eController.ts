import { Request, Response } from "express";
import clearDB from "../services/e2eService.js";

export default async function clear(req: Request, res: Response) {
  await clearDB();

  res.sendStatus(204);
}

import { Router } from "express";
import clear from "../controllers/e2eController.js";

const e2eRouter = Router();

e2eRouter.post("/reset", clear);

export default e2eRouter;

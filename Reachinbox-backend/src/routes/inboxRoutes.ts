import { Router } from "express";
import { getInboxEmails } from "../controllers/inboxController";

const router = Router();

router.get("/", getInboxEmails);

export default router;

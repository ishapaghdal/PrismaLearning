import { Router } from "express";
import { createJsonUser, getAllJsonUser} from "../Controller/JsonUserController.js";

const router = Router()

router.post("/", createJsonUser);
router.get("/" , getAllJsonUser)
export default router;
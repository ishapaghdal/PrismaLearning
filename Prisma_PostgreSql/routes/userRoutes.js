import { Router } from "express";
import { createUser , getAllUser, getUserById, UpdateUser} from "../Controller/UserController.js";

const router = Router()

router.post("/" , createUser )
router.put("/:id" , UpdateUser )
router.get("/:id" , getUserById)
router.get("/" , getAllUser )

export default router;
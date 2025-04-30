import { Router } from "express";
import { createComment , getAllComment, getCommentById} from "../Controller/CommentController.js";

const router = Router()

router.post("/" , createComment )
router.get("/:id" , getCommentById)
router.get("/" , getAllComment )

export default router;
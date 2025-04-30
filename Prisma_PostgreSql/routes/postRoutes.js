import { Router } from "express";
import { createPost , getAllPost, getPostById} from "../Controller/PostController.js";

const router = Router()

router.post("/" , createPost )
router.get("/:id" , getPostById)
router.get("/" , getAllPost )

export default router;
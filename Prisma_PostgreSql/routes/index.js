import { Router } from "express";
import userRoutes from "./userRoutes.js"
import postRoutes from "./postRoutes.js"
import commentRoutes from "./commentRoutes.js"
import jsonUserRoutes from "./jsonUserRoutes.js"

const router = Router();

router.use("/api/user", userRoutes)
router.use("/api/post", postRoutes)
router.use("/api/comment", commentRoutes)
router.use("/api/jsonuser", jsonUserRoutes)

export default router
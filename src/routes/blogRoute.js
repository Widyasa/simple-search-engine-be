import express from "express";
import {getBlogById, getBlogs} from "../controllers/blogController.js";

const router = express.Router();
router.get('/blogs', getBlogs);
router.get('/blogs/:id', getBlogById);
export default router;
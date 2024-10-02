import express from "express";
import bodyParser from "body-parser";
import cors from "cors"
import router from "./routes/blogRoute.js";


const app = express();
app.use(cors());
app.use(bodyParser.json());

// Use /api/v1 as a prefix for all routes related to articles
app.use('/api/v1', router);

export default app;


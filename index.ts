import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import "express-async-errors";
import router from "./routes/index.js";
import errorHandlingMiddleware from "./middlewares/errorHandlingMiddleware.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(json());
app.use(router);
app.use(errorHandlingMiddleware);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server funcionando na porta ${PORT}`));

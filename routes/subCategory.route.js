import {Router} from "express"
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const subCategoryRouter = Router();
import { AddSubCategoryController, fetchAllSubCategoryController } from "../controllers/subCategory.controller.js";



subCategoryRouter.post("/add-subCategory",auth,upload.single("image"),AddSubCategoryController)
subCategoryRouter.get("/fetch-subCategory",auth,fetchAllSubCategoryController)

export default subCategoryRouter
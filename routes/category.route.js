import {Router} from "express"
import auth from "../middleware/auth.js"
import { AddCategoryController, deleteCategoryController, fetchCategoryController, updateCategoryController } from "../controllers/category.controller.js"
import upload from "../middleware/multer.js"

const categoryRouter = Router()
categoryRouter.post("/add-category",auth,upload.single("image"),AddCategoryController)
categoryRouter.get("/fetch-category",auth,fetchCategoryController)
categoryRouter.put("/update-category",auth,upload.single("image"),updateCategoryController)
categoryRouter.delete("/delete-category/:id",auth,deleteCategoryController)

export default categoryRouter
import { Router } from "express";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import { createProductController, getAllProductByCategoryUsingIdController, getProductByCategory, getProductByCategoryIdAndsubCategoryId, getProductController, getProductDetailByIdController, getSearchedProduct } from "../controllers/product.controller.js";

const productRouter = Router()

productRouter.post("/add-product",auth,upload.array("image",10),createProductController)
productRouter.post("/get-product",auth,getProductController)
productRouter.post("/get-productByCategory",getProductByCategory)
productRouter.post("/get-productByCategoryIdAndsubCategoryId",getProductByCategoryIdAndsubCategoryId)
productRouter.post("/get-productDetailById",getProductDetailByIdController)
productRouter.post("/get-AllProductByCategory",getAllProductByCategoryUsingIdController)
productRouter.post("/get-searchProduct",getSearchedProduct)


export default productRouter
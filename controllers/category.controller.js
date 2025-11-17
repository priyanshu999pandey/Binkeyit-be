import CategoryModel from "../models/category.model.js";
import uploadImageCloudinary from "../utils/uploadImageCloudinary.js";
import ProductModel from "../models/product.model.js";
import SubCategoryModel from "../models/subCategory.model.js";
export const AddCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const file = req.file; // multer.single("image")
    console.log(file);

    if (!name || !file) {
      return res.status(400).json({
        message: "Name and Image are required",
        error: true,
        success: false,
      });
    }

    // Upload image to Cloudinary
    const uploadedImage = await uploadImageCloudinary(file);

    if (!uploadedImage || !uploadedImage.secure_url) {
      return res.status(500).json({
        message: "Image upload failed",
        error: true,
        success: false,
      });
    }

    // Save category with Cloudinary image URL
    const addCategory = await CategoryModel.create({
      name,
      image: uploadedImage.secure_url,
    });

    return res.status(200).json({
      message: "Category created successfully",
      success: true,
      error: false,
      data: addCategory,
    });
  } catch (error) {
    console.log("Controller Error:", error);
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

export const fetchCategoryController = async (req, res) => {
  try {
    const data = await CategoryModel.find();
    if (!data) {
      return res.status(404).json({
        message: "category not found",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "catogery found sucessfully",
      error: false,
      success: true,
      data: data,
    });
  } catch (error) {
    console.log("Controller Error:", error);
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

export const updateCategoryController = async (req, res) => {
  try {
    // console.log("Headers Content-Type:", req.headers["content-type"]);
    // console.log("req.body:", req.body);
    // console.log("req.file:", req.file);

    // multer will populate req.file for 'image' and req.body for other fields
    const { categoryId, name, oldImage } = req.body;
    const file = req.file; // optional

    if (!categoryId) {
      return res.status(400).json({
        message: "categoryId is required",
        error: true,
        success: false,
      });
    }

    // Validate name
    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required",
        error: true,
        success: false,
      });
    }

    let imageUrl = oldImage || "";

    // If user uploaded a new file, upload to Cloudinary
    if (file) {
      /*
        NOTE:
        - If you use multer.memoryStorage(), file.buffer will exist.
        - If you use disk storage (dest), file.path will exist.
        Make sure uploadImageCloudinary can accept either a path or a buffer/file object.
        Below we pass the multer file object; adapt uploadImageCloudinary if needed.
      */
      const uploaded = await uploadImageCloudinary(file);
      if (!uploaded || !uploaded.secure_url) {
        return res.status(500).json({
          message: "Image upload failed",
          error: true,
          success: false,
        });
      }
      imageUrl = uploaded.secure_url;
    }

    // Update document
    const updateResult = await CategoryModel.findByIdAndUpdate(
      categoryId,
      { name: name.trim(), image: imageUrl },
      { new: true }
    );

    if (!updateResult) {
      return res.status(404).json({
        message: "Category not found",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "Category updated successfully",
      error: false,
      success: true,
      data: updateResult,
    });
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

export const deleteCategoryController = async (req, res) => {
  try {
    const categoryId = req.params.id;
    console.log(categoryId);

    if (!categoryId) {
      return res.status(400).json({
        message: "Invalid CategoryId",
        error: true,
        success: false,
      });
    }

    const checkSubCategory = await SubCategoryModel.countDocuments({
      category: { $in: [categoryId] },
    });

    const checkProduct = await ProductModel.countDocuments({
      category: { $in: [categoryId] },
    });

    if (checkSubCategory > 0 || checkProduct > 0) {
      return res.status(400).json({
        message: "Can't delete. This category has subcategories and product",
        error: true,
        success: false,
      });
    }

    const deleteCategory = await CategoryModel.findByIdAndDelete({
      _id: categoryId,
    });

    if (!deleteCategory) {
      return res.status(400).json({
        message: " Failed to delete",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "deleted Successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};


import SubCategoryModel from "../models/subCategory.model.js";
import uploadImageCloudinary from "../utils/uploadImageCloudinary.js";

 export const AddSubCategoryController = async (req, res) => {
  try {

    const {name,category} = req.body;
    const file = req.file

    if(!name || !category  || !file){
        return res.status(400).json({
            message:"All fields shoul be filled",
            success:false,
            error:true,
        })
    }

    const uploadedImage = await uploadImageCloudinary(file);
    if (!uploadedImage || !uploadedImage.secure_url) {
      return res.status(500).json({
        message: "Image upload failed",
        error: true,
        success: false,
      });
    }

    const addSubCategory = await SubCategoryModel.create({
        name,
        image:uploadedImage.secure_url,
        category
    })
 
    return res.status(201).json({
        message:"sub category Added successfuly",
        success:true,
        error:false,
        data:addSubCategory
    })
    


  } catch (error) {
    console.log("Controller Error:", error);
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

export const fetchAllSubCategoryController = async(req,res)=>{
    try {

        const fetchedData = await SubCategoryModel.find();
        if(!fetchedData){
            return res.status(400).json({
                message:"Failed to fetch sub categories",
                error:true,
                success:false,
            })
        }

        return res.status(200).json({
            message:"sub categories fetched Successsfully",
            error:false,
            success:true,
            data:fetchedData
        })
        
    } catch (error) {
          console.log("Controller Error:", error);
            return res.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false,
            });
    }
}

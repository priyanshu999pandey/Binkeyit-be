import ProductModel from "../models/product.model.js";
import uploadImageCloudinary from "../utils/uploadImageCloudinary.js";

// export const createProductController = async (req, res) => {
//   try {
//     const {
//       name,
//       category,
//       subCategory,
//       unit,
//       stock,
//       price,
//       discount,
//       description,
//       more_detail
//     } = req.body;

//      const files = req.files || (req.file ? [req.file] : []);

//     if(!name || !category || !subCategory || !unit || !stock || !price || !description ){
//         return res.status(400).json({
//             message:"All fields required",
//             success:false,
//             error:true
//         })
//     }
//     console.log("fileData",files)
//     if (files.length == 0) {
//       return res.status(400).json({
//         success: false,
//         message: "atleast one image required",

//       });
//     }

//     const imageUrls = [];

//     for (const file of files) {
//       // uploadImageCloudinary(file) should return something like { url, public_id } or { secure_url, public_id }
//       const result = await uploadImageCloudinary(file);

//       if (!result) {
//         // if upload fails (null/undefined) abort and return error
//         return res.status(500).json({
//           success: false,
//           message: "Image upload failed for one of the files"
//         });
//       }

//       // accept either result.url or result.secure_url
//       const url = result.url || result.secure_url || result.secureUrl || result.secure_URL;
//       if (!url) {
//         return res.status(500).json({
//           success: false,
//           message: "Upload succeeded but no url returned from uploadImageCloudinary"
//         });
//       }

//       imageUrls.push(url);
//     }

//      const payload = {
//       name,
//       image: imageUrls,                   // array of strings (urls)
//       category,
//       subCategory,
//       unit,
//       stock,
//       price,
//       discount,
//       description,
//       more_detail,
//     };

//     const product = await ProductModel.create(payload)

//     return res.status(201).json({
//       success: true,
//       message: "Product created successfully",
//       data:product
//     });

//   } catch (error) {
//     console.error("Controller Error:", error);
//     return res.status(500).json({
//       message: error.message || "Internal Server Error",
//       error: true,
//       success: false,
//     });
//   }
// };

export const createProductController = async (req, res) => {
  try {
    const {
      name,
      category,
      subCategory,
      unit,
      stock,
      price,
      discount,
      description,
      more_detail,
    } = req.body;

    // ---------- parse JSON-string fields (if frontend sent JSON.stringify)
    let categoryParsed = category;
    let subCategoryParsed = subCategory;
    let moreDetailParsed = more_detail;

    if (typeof category === "string") {
      try {
        categoryParsed = JSON.parse(category);
      } catch (e) {
        // keep original string if parse fails
        categoryParsed = category;
      }
    }

    if (typeof subCategory === "string") {
      try {
        subCategoryParsed = JSON.parse(subCategory);
      } catch (e) {
        subCategoryParsed = subCategory;
      }
    }

    if (typeof more_detail === "string") {
      try {
        moreDetailParsed = JSON.parse(more_detail);
      } catch (e) {
        moreDetailParsed = more_detail;
      }
    }
    // ---------- end parse

    const files = req.files || (req.file ? [req.file] : []);

    if (
      !name ||
      !category ||
      !subCategory ||
      !unit ||
      !stock ||
      !price ||
      !description
    ) {
      return res.status(400).json({
        message: "All fields required",
        success: false,
        error: true,
      });
    }
    console.log("fileData", files);
    if (files.length == 0) {
      return res.status(400).json({
        success: false,
        message: "atleast one image required",
      });
    }

    const imageUrls = [];

    for (const file of files) {
      const result = await uploadImageCloudinary(file);

      if (!result) {
        return res.status(500).json({
          success: false,
          message: "Image upload failed for one of the files",
        });
      }

      const url =
        result.url ||
        result.secure_url ||
        result.secureUrl ||
        result.secure_URL;
      if (!url) {
        return res.status(500).json({
          success: false,
          message:
            "Upload succeeded but no url returned from uploadImageCloudinary",
        });
      }

      imageUrls.push(url);
    }

    const payload = {
      name,
      image: imageUrls,
      category: categoryParsed, // <-- use parsed value
      subCategory: subCategoryParsed, // <-- use parsed value
      unit,
      stock,
      price,
      discount,
      description,
      more_detail: moreDetailParsed, // <-- use parsed value
    };

    const product = await ProductModel.create(payload);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
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

export const getProductController = async (req, res) => {
  try {
    let { page, limit, search } = req.body;

    // convert to numbers and set defaults
    page = Number(page) || 1;
    limit = Number(limit) || 10;

    const query = search
      ? { $text: { $search: search } } // ensure you have a text index on relevant fields
      : {};

    const skip = (page - 1) * limit;

    const [data, totalCount] = await Promise.all([
      ProductModel.find(query)
        .sort({ createdAt: -1 }) // use sort, not toSorted
        .skip(skip)
        .limit(limit),
      ProductModel.countDocuments(query),
    ]);

    return res.status(200).json({
      message: "Product Data",
      error: false,
      success: true,
      page,
      limit,
      totalCount,
      totalNoPage: Math.ceil(totalCount / limit),
      data,
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

export const getProductByCategory = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        message: "provide category id",
        error: true,
        success: false,
      });
    }

    const product = await ProductModel.find({
      category: { $in: id },
    })
      .limit(10)
      .sort({ created: -1 });

    return res.status(200).json({
      message: "category product list",
      data: product,
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

export const getProductByCategoryIdAndsubCategoryId = async (req, res) => {
  try {
    let { categoryId, subCategoryId, page, limit } = req.body;

    if (!categoryId || !subCategoryId) {
      return res.status(400).json({
        message: "Provide categoryId and subCategoryId",
        error: true,
        success: false,
      });
    }

    if (!page) {
      page = 1;
    }

    if (!limit) {
      limit = 10;
    }
    const query = {
      category: { $in: categoryId },
      subCategory: { $in: subCategoryId },
    };

    const skip = (page - 1) * limit;

    const [data, dataCount] = await Promise.all([
      ProductModel.find(query).sort({ createdAt: -1 }).skip().limit(limit),
      ProductModel.countDocuments(query),
    ]);

    return res.status(200).json({
      message: "Product list",
      data: data,
      totalCount: dataCount,
      page: page,
      limit: limit,
      success: true,
      error: false,
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

export const getProductDetailByIdController = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        message: "product Id required",
        success: false,
        error: true,
      });
    }

    const productData = await ProductModel.findById(productId);

    if (!productData) {
      return res.status(401).json({
        message: "Data not found",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "productData fetched successfully",
      success: true,
      error: false,
      data: productData,
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

export const getAllProductByCategoryUsingIdController = async(req,res)=>{
   try {

    const {categoryId} = req.body;

    if(!categoryId){
      return res.status(400).json({
        message:"Id required",
        success:false,
        error:true
      })
    }

    const data = await ProductModel.find({
      category:categoryId
    })
     
    if(!data){
      return res.status(400).json({
        message:"datanot found",
        error:true,
        success:false
      })
    }

    return res.json({
      message:"data fetched successfully",
      error:false,
      success:true,
      data:data
    })
    
   } catch (error) {
     console.error("Controller Error:", error);
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
   }
}

export const getSearchedProduct = async(req,res)=>{
  try {

    let {search,page,limit} = req.body || {};

    if(!page){
      page = 1
    }

    if(!limit){
      limit=10
    }

    const skip = (page-1)*limit;

    const query = search?{
       $text:{
        $search:search
       }
    } :{}

    const [data,dataCount] = await Promise.all([
      ProductModel.find(query).sort({createdAt:-1}).skip(skip).limit(limit).populate('category').populate('subCategory'),
      ProductModel.countDocuments(query)
    ])

    return res.status(200).json({
      message:"Product fetched successfully",
      error:false,
      success:true,
      limit:limit,
      totalCount:dataCount,
      totalPage :Math.ceil(dataCount/limit),
      page:page,
      data:data,
      
    })
    
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
}


// export const getSearchedProduct = async (req, res) => {
//   try {
//     // grab from req.body (not "req,body")
//     let { search, page, limit } = req.body || {};

//     // convert to numbers and set sane defaults
//     page = Number(page) || 1;
//     limit = Number(limit) || 10;

//     const skip = (page - 1) * limit;

//     // if you want text search, make sure you have a text index on the fields in the ProductModel
//     const query = search
//       ? { $text: { $search: search } }
//       : {};

//     // IMPORTANT: await Promise.all so you get actual results (not Promises)
//     const [data, dataCount] = await Promise.all([
//       ProductModel.find(query)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         // populate properly (can call populate multiple times)
//         .populate('category')
//         .populate('subCategory'),
//       ProductModel.countDocuments(query)
//     ]);

//     return res.status(200).json({
//       message: "Product fetched successfully",
//       error: false,
//       success: true,
//       limit,
//       page,
//       totalCount: dataCount,
//       totalPage: limit > 0 ? Math.ceil(dataCount / limit) : 0,
//       data,
      
//     });

//   } catch (error) {
//     console.error("Controller Error:", error);
//     return res.status(500).json({
//       message: error.message || "Internal Server Error",
//       error: true,
//       success: false,
//     });
//   }
// };

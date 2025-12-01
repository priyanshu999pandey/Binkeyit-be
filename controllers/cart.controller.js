import CartProductModel from "../models/cartProduct.model.js"
import UserModel from "../models/user.model.js"

export const addToCartItemController = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;
   
    if(!userId){
        return res.status(400).json({
            message:"User not Found",
            success:false,
            error:true,         
        })
    }
    if(!productId){
        return res.status(400).json({
            message:"productId not Found",
            success:false,
            error:true,         
        })
    }

    const isItemAlreadyAdded = await CartProductModel.findOne({
       userId,
       productId
    })
    
    console.log("isItemAlreadyAdded",isItemAlreadyAdded)

    if(isItemAlreadyAdded){
      return res.status(400).json({
        message:"Item Already Added",
        success:false,
        error:true,
      })
    }

    const  cartItem = await CartProductModel.create({
         productId:productId,
         userId:userId
    })
      
    const updateCartUser = await  UserModel.updateOne({_id:userId},{
        $push:{
            shopping_cart:productId
        }
    })

    return res.status(201).json({
        message:"Added To cart",
        error:false,
        success:true,
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

export const getCartItemController = async(req,res)=>{
  try {
      const  userId = req.userId;

      if(!userId){
        return res.status(400).json({
          message:"provide UserID",
          error:true,
          success:false,
        })
      }

      const cartData = await CartProductModel.find({
        userId:userId
      }).populate('productId')

     if(!cartData){
        return res.status(400).json({
          message:"Data not found",
          error:true,
          success:false,
        })
      }

      return res.status(200).json({
         message:"Get cartData successfully",
         error:false,
         success:true,
         cartItems:cartData
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

export const updateCartItemQtyController = async(req,res)=>{
  try {
    const userId = req.userId
    const {_id,qty} = req.body

    if(!_id || !qty){
      return res.status(400).json({
        message:"provide _id, qty",
        success:false,
        error:true
      })
    }

    const updateQty = await CartProductModel.updateOne({
      _id:_id  
    },{
      quantity:qty
    })

     return res.status(200).json({
       message:"quantity updated sucessfully",
       success:true,
       error:false,
       data:updateQty
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

export const deleteCartItemQtyController = async(req,res)=>{
   try {
    const userId = req.userId;
    console.log("id--",req.body);

    const {id} = req.body;

    if(!id){
      return res.status(400).json({
        message:"Item not found",
        success:false,
        error:true,
      })
    }

    const deleteCartItem = await CartProductModel.deleteOne({_id :id, userId:userId})

    return res.status(200).json({
      message:"Item removed",
      error:false,
      success:true,
      data:deleteCartItem
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

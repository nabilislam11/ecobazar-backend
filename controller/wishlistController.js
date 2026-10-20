const mognoose = require("mongoose");
const productSchema = require("../model/productSchema");
const wishlishtmodel = require("../model/wishlishtmodel");
const toggleWishlistController = async (req, res) => {
  try {
    const { userId, proId } = req.body;
    if (
      !mongoose.Types.ObjectId.isValid(userId || "") ||
      !mongoose.Types.ObjectId.isValid(proId || "")
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid userId and productId are required",
      });
    }
    const product = await productSchema.findById(proId).select("_id");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found ",
      });
    }
    const existingItem = await wishlishtmodel.findOne({
      user: userId,
      product: proId,
    });
    if (existingItem) {
      await existingItem.deleteOne();
      return res.status(200).json({
        success: true,
        wishlisted: false,
        message: "Removed from wishlist",
      });
    }
    await Wishlist.create({
      user: userId,
      product: proId,
    });

    return res.status(201).json({
      success: true,
      wishlisted: true,
      message: "Added to wishlist",
    });
  } catch (error) {
    console.error("Toggle wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update wishlist",
    });
  }
};
const getWishlistController = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId || "")) {
      return res.status(400).json({
        success: false,
        message: "Valid userId is required",
      });
    }
    const items = await wishlishtmodel
      .find({ user: userId })
      .populate("product");
    const products = items.map((item) => item.product).filter(Boolean);
    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load wishlist",
    });
  }
};
module.exports = { toggleWishlistController, getWishlistController };

const Category = require("../model/categorySchema");
const productSchema = require("../model/productSchema");

// ============================
// CREATE CATEGORY
// ============================
const createCategory = async (req, res) => {
  try {
    const { name, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const existingCategory = await Category.findOne({
      name: {
        $regex: `^${name.trim()}$`,
        $options: "i",
      },
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }
    // 4. Slug generate
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const category = await Category.create({
      name: name.trim(),
      status: status || "active",
      slug,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.log("Create category error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ============================
// GET ALL CATEGORY
// ============================
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({})

      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    console.log("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const getProductsByCategory = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("CATEGORY ID:", id);
    const products = await productSchema.find({
      category: id,
    });
    console.log("PRODUCTS:", products);

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// ============================
// GET SINGLE CATEGORY
// ============================
const getSingleCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // ১. ক্যাটাগরি ডাটা আনা (.lean() ব্যবহার করলে Mongoose object থেকে প্লেইন JS object হয়ে যায়)
    const category = await Category.findById(id).lean();

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // ২. এই ক্যাটাগরির আন্ডারে কয়টা প্রোডাক্ট আছে তা Product মডেল থেকে কাউন্ট করা
    // (আপনার Product মডেলে category ফিল্ডের নাম যা দেওয়া আছে সেটা ব্যবহার করবেন)
    const productCount = await productSchema.countDocuments({ category: id });

    // ৩. ক্যাটাগরির সাথে কাউন্ট যোগ করে পাঠিয়ে দেওয়া
    return res.status(200).json({
      success: true,
      data: {
        ...category,
        id: category._id,
        productCount: productCount, // <--- এই আসল কাউন্টটা এখানে যাচ্ছে
      },
    });
  } catch (error) {
    console.log("Get category error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
const deactiveCategory = async (req, res) => {};

// ============================
// UPDATE CATEGORY
// ============================
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (name && name.trim() !== category.name) {
      const existingCategory = await Category.findOne({
        name: { $regex: `^${name.trim()}$`, $options: "i" },
        _id: { $ne: id },
      });

      if (existingCategory) {
        return res
          .status(409)
          .json({ success: false, message: "Category name already exists" });
      }

      category.name = name.trim();
      // নতুন নামের উপর ভিত্তি করে নতুন স্লাগ তৈরি করুন
      category.slug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    if (status) {
      category.status = status;
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.log("Update category error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ============================
// DELETE CATEGORY
// ============================
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // ১. চেক করুন এই ক্যাটাগরিতে কোনো প্রোডাক্ট আছে কিনা
    const productCount = await productSchema.countDocuments({ category: id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete! This category has ${productCount} products.`,
      });
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.log("Delete category error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  getProductsByCategory,
  updateCategory,
  deleteCategory,
};

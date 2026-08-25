const Category = require("../model/categorySchema");

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

    const category = await Category.create({
      name: name.trim(),
      status: status || "active",
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
    const categories = await Category.find({}).sort({ createdAt: -1 });

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

// ============================
// GET SINGLE CATEGORY
// ============================
const getSingleCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      data: category,
    });
  } catch (error) {
    console.log("Get single category error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

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
        name: {
          $regex: `^${name.trim()}$`,
          $options: "i",
        },
        _id: { $ne: id },
      });

      if (existingCategory) {
        return res.status(409).json({
          success: false,
          message: "Category name already exists",
        });
      }

      category.name = name.trim();
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

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: category,
    });
  } catch (error) {
    console.log("Delete category error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};

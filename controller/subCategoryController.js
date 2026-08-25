const SubCategory = require("../model/subCategorySchema");

const Category = require("../model/categorySchema");

// ============================
// CREATE SUB CATEGORY
// ============================
const createSubCategory = async (req, res) => {
  try {
    const { name, category, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Sub category name is required",
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Parent category not found",
      });
    }

    const existingSubCategory = await SubCategory.findOne({
      name: {
        $regex: `^${name.trim()}$`,
        $options: "i",
      },
      category,
    });

    if (existingSubCategory) {
      return res.status(409).json({
        success: false,
        message: "This sub category already exists in this category",
      });
    }

    const subCategory = await SubCategory.create({
      name: name.trim(),
      category,
      status: status || "active",
    });

    return res.status(201).json({
      success: true,
      message: "Sub category created successfully",
      data: subCategory,
    });
  } catch (error) {
    console.log("Create sub category error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ============================
// GET ALL SUB CATEGORY
// ============================
const getAllSubCategories = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    const subCategories = await SubCategory.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Sub categories fetched successfully",
      data: subCategories,
    });
  } catch (error) {
    console.log("Get sub categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ============================
// GET SINGLE SUB CATEGORY
// ============================
const getSingleSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const subCategory = await SubCategory.findById(id).populate(
      "category",
      "name",
    );

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Sub category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sub category fetched successfully",
      data: subCategory,
    });
  } catch (error) {
    console.log("Get single sub category error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ============================
// UPDATE SUB CATEGORY
// ============================
const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, category, status } = req.body;

    const subCategory = await SubCategory.findById(id);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Sub category not found",
      });
    }

    if (category) {
      const categoryExists = await Category.findById(category);

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Parent category not found",
        });
      }

      subCategory.category = category;
    }

    if (name && name.trim()) {
      subCategory.name = name.trim();
    }

    if (status) {
      subCategory.status = status;
    }

    await subCategory.save();

    return res.status(200).json({
      success: true,
      message: "Sub category updated successfully",
      data: subCategory,
    });
  } catch (error) {
    console.log("Update sub category error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ============================
// DELETE SUB CATEGORY
// ============================
const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const subCategory = await SubCategory.findByIdAndDelete(id);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Sub category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sub category deleted successfully",
      data: subCategory,
    });
  } catch (error) {
    console.log("Delete sub category error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createSubCategory,
  getAllSubCategories,
  getSingleSubCategory,
  updateSubCategory,
  deleteSubCategory,
};

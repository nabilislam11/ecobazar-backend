const mongoose = require("mongoose");
const Product = require("../model/productSchema");
// const { readSheet } = require("read-excel-file/node");
const cloudinary = require("cloudinary").v2;
const emptyFieldValidation = require("../utils/validation");
// const schema = {
//   title: {
//     column: "title",
//     type: String,
//   },

//   price: {
//     column: "price",
//     type: Number,
//   },

//   category: {
//     column: "category",
//     type: String,
//   },

//   description: {
//     column: "description",
//     type: String,
//   },

//   stock: {
//     column: "stock",
//     type: Number,
//   },

//   discountType: {
//     column: "discountType",
//     type: String,
//   },

//   discount: {
//     column: "discount",
//     type: Number,
//   },

//   brand: {
//     column: "brand",
//     type: String,
//   },

//   subCategory: {
//     column: "subCategory",
//     type: String,
//   },

//   status: {
//     column: "status",
//     type: String,
//   },

//   tag: {
//     column: "tag",
//     type: String,
//   },

//   discountStartDate: {
//     column: "discountStartDate",
//     type: Date,
//   },

//   discountEndDate: {
//     column: "discountEndDate",
//     type: Date,
//   },
// };
const createProductController = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
    const {
      title,
      price,
      category,
      description,
      stock,
      discountType,
      discount,
      brand,
      subCategory,
      status,
      section,
      tag,
      discountStartDate,
      discountEndDate,
      isMain,
    } = req.body;

    // =========================
    // IMAGE HANDLING
    // =========================

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required",
      });
    }

    const images = req.files.map((item, index) => ({
      url: item.path,
      public_id: item.public_id || item.filename,
      isMain: String(isMain) === String(index),
    }));

    // =========================
    // STOCK VALIDATION
    // =========================

    if (!stock || stock < 1) {
      return res.status(400).json({
        success: false,
        message: "Stock must be greater than 0",
      });
    }

    // =========================
    // DISCOUNT VALIDATION
    // =========================

    if (discountType === "flat") {
      if (Number(discount) < 0) {
        return res.status(400).json({
          success: false,
          message: "Discount cannot be negative",
        });
      }

      if (Number(discount) >= Number(price)) {
        return res.status(400).json({
          success: false,
          message: "Flat discount must be lower than price",
        });
      }
    }

    if (discountType === "percentage") {
      if (Number(discount) < 0 || Number(discount) >= 100) {
        return res.status(400).json({
          success: false,
          message: "Percentage discount must be between 0 and 100",
        });
      }
    }

    // =========================
    // DATE VALIDATION
    // =========================

    const startDate = new Date(discountStartDate);
    const endDate = new Date(discountEndDate);

    if (discountStartDate && discountEndDate && startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be later than end date",
      });
    }

    // =========================
    // REQUIRED FIELD VALIDATION
    // =========================

    emptyFieldValidation(res, title, price, category);

    // =========================
    // CHECK EXISTING PRODUCT
    // =========================

    const existingProduct = await Product.findOne({ title });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "Product title already exists",
      });
    }

    // =========================
    // SKU
    // =========================

    const sku = `${Date.now()}-${new Date().getFullYear()}`;
    const slug = title.toLowerCase().toString().trim().split(" ").join("-");

    // =========================
    // CREATE PRODUCT
    // =========================

    const product = new Product({
      ...req.body,
      subCategory: subCategory || undefined,
      sku,
      slug: slug,
      images,
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: "Successfully created product",
      data: product,
    });
  } catch (error) {
    console.log("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
// const bulkCreateProductController = async (req, res) => {
//   console.log(req.file);
//   // const data = await readSheet(`./${req.file.path}`);
//   // console.log(data, "dasta");
//   const { objects, errors } = await readSheet(`./${req.file.path}`, { schema });

//   console.error(errors);
//   console.log(objects);
// };

const getAllProduct = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 12,
      category,
      brand,
      section,
      minPrice,
      maxPrice,
      sort = "latest",
      q,
    } = req.query;

    // 1. Pagination validation
    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const limit = Math.min(48, Math.max(1, parseInt(pageSize, 10) || 12));

    const skip = (currentPage - 1) * limit;

    // 2. Validate category ID
    if (category && !mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // 3. Validate price filters
    const min = minPrice !== undefined ? Number(minPrice) : undefined;

    const max = maxPrice !== undefined ? Number(maxPrice) : undefined;

    if (
      (min !== undefined && (!Number.isFinite(min) || min < 0)) ||
      (max !== undefined && (!Number.isFinite(max) || max < 0)) ||
      (min !== undefined && max !== undefined && min > max)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid price range",
      });
    }

    // 4. Escape search text
    const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // 5. Common filters for available facets
    const baseFilter = {};

    if (category) {
      baseFilter.category = new mongoose.Types.ObjectId(category);
    }

    if (q && q.trim()) {
      const searchRegex = new RegExp(escapeRegex(q.trim()), "i");

      baseFilter.$or = [
        { title: searchRegex },
        { shortDescription: searchRegex },
        { description: searchRegex },
      ];
    }

    // 6. Product listing filters
    const listingFilter = { ...baseFilter };

    if (brand && brand.trim()) {
      listingFilter.brand = new RegExp(`^${escapeRegex(brand.trim())}$`, "i");
    }

    const allowedSections = [
      "todaysDeal",
      "featuredProducts",
      "populerDeals",
      "slider",
      "none",
    ];

    if (section) {
      if (!allowedSections.includes(section)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product section",
        });
      }

      listingFilter.section = section;
    }

    // 7. Calculate effective price after discount
    const effectivePriceExpression = {
      $switch: {
        branches: [
          {
            case: {
              $and: [
                { $eq: ["$discountType", "percentage"] },
                { $gt: [{ $ifNull: ["$discount", 0] }, 0] },
                {
                  $or: [
                    { $eq: [{ $ifNull: ["$discountStartDate", null] }, null] },
                    { $lte: ["$discountStartDate", "$$NOW"] },
                  ],
                },
                {
                  $or: [
                    { $eq: [{ $ifNull: ["$discountEndDate", null] }, null] },
                    { $gte: ["$discountEndDate", "$$NOW"] },
                  ],
                },
              ],
            },
            then: {
              $multiply: [
                "$price",
                {
                  $subtract: [
                    1,
                    {
                      $divide: [{ $ifNull: ["$discount", 0] }, 100],
                    },
                  ],
                },
              ],
            },
          },
          {
            case: {
              $and: [
                { $eq: ["$discountType", "flat"] },
                { $gt: [{ $ifNull: ["$discount", 0] }, 0] },
                {
                  $or: [
                    { $eq: [{ $ifNull: ["$discountStartDate", null] }, null] },
                    { $lte: ["$discountStartDate", "$$NOW"] },
                  ],
                },
                {
                  $or: [
                    { $eq: [{ $ifNull: ["$discountEndDate", null] }, null] },
                    { $gte: ["$discountEndDate", "$$NOW"] },
                  ],
                },
              ],
            },
            then: {
              $subtract: ["$price", { $ifNull: ["$discount", 0] }],
            },
          },
        ],
        default: "$price",
      },
    };

    // 8. Fetch filter information from matching products
    const [metadata = {}] = await Product.aggregate([
      { $match: baseFilter },
      {
        $addFields: {
          effectivePrice: effectivePriceExpression,
        },
      },
      {
        $facet: {
          priceRange: [
            {
              $group: {
                _id: null,
                minPrice: { $min: "$effectivePrice" },
                maxPrice: { $max: "$effectivePrice" },
              },
            },
          ],
          brands: [
            {
              $match: {
                brand: { $type: "string", $ne: "" },
              },
            },
            { $group: { _id: "$brand" } },
            { $sort: { _id: 1 } },
          ],
          sections: [
            {
              $match: {
                section: { $nin: [null, "", "none"] },
              },
            },
            { $group: { _id: "$section" } },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]);

    const priceRange = metadata.priceRange?.[0] || {
      minPrice: 0,
      maxPrice: 0,
    };

    const brands = (metadata.brands || []).map((item) => item._id);
    const sections = (metadata.sections || []).map((item) => item._id);

    // 9. Apply effective price filters
    const priceMatch = {};

    if (min !== undefined) priceMatch.$gte = min;
    if (max !== undefined) priceMatch.$lte = max;

    // 10. Sorting
    const sortOptions = {
      latest: { createdAt: -1, _id: -1 },
      "price-asc": { effectivePrice: 1, _id: -1 },
      "price-desc": { effectivePrice: -1, _id: -1 },
    };

    const selectedSort = sortOptions[sort] || sortOptions.latest;

    // 11. Fetch paginated products
    const pipeline = [
      { $match: listingFilter },
      {
        $addFields: {
          effectivePrice: effectivePriceExpression,
        },
      },
    ];

    if (Object.keys(priceMatch).length > 0) {
      pipeline.push({
        $match: {
          effectivePrice: priceMatch,
        },
      });
    }

    pipeline.push(
      { $sort: selectedSort },
      {
        $facet: {
          items: [{ $skip: skip }, { $limit: limit }],
          count: [{ $count: "totalItems" }],
        },
      },
    );

    const [result = { items: [], count: [] }] =
      await Product.aggregate(pipeline);

    const items = result.items || [];
    const totalItems = result.count?.[0]?.totalItems || 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    // 12. Response
    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",

      // Keep data as an array for existing components
      data: items,

      // New pagination information for Shop
      items,

      pagination: {
        currentPage,
        pageSize: limit,
        totalItems,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },

      totalItems,
      totalPages,

      filters: {
        minPrice: priceRange.minPrice ?? 0,
        maxPrice: priceRange.maxPrice ?? 0,
        brands,
        sections,
      },
    });
  } catch (error) {
    console.error("Get all products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    // ID hole _id diye search
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    } else {
      // ID na hole slug diye search
      product = await Product.findOne({ slug: id });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: `Get Single Product${product.title} `,
      data: product,
    });
  } catch (error) {
    console.log(error, "getsingleproduct error");
    return res.status(200).json({
      success: false,
      message: "Server error ",
    });
  }
};
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete({ _id: id });
    if (!product) {
      return res.status(401).json({
        success: false,
        message: "Product is not exist",
      });
    }
    return res.status(200).json({
      success: true,
      message: `Delete successfully${product.title}`,
      data: product,
    });
  } catch (error) {
    console.log(error, "getsingleproduct error");
    return res.status(500).json({
      success: false,
      message: "Server error ",
    });
  }
};
/** 
update product note :
(node:19036) [MONGOOSE] Warning: mongoose: the `new` option for `findOneAndUpdate()` and `findOneAndReplace()` is deprecated. Use `returnDocument: 'after'` instead.
(Use `node --trace-warnings ...` to show where the warning was created)
*/
const getCloudinaryPublicId = (image) => {
  if (image?.public_id) {
    return image.public_id;
  }

  if (!image?.url) return null;

  try {
    const imageUrl = new URL(image.url);

    if (imageUrl.hostname !== "res.cloudinary.com") {
      return null;
    }

    const marker = "/image/upload/";
    const uploadIndex = imageUrl.pathname.indexOf(marker);

    if (uploadIndex === -1) return null;

    let publicId = imageUrl.pathname.slice(uploadIndex + marker.length);

    // Remove version prefix, e.g. v1792106068/
    publicId = publicId.replace(/^v\d+\//, "");

    // Remove file extension
    publicId = publicId.replace(/\.[^/.]+$/, "");

    return publicId || null;
  } catch {
    return null;
  }
};

const deleteCloudinaryImage = async (image) => {
  const publicId = getCloudinaryPublicId(image);

  if (!publicId) {
    console.warn("No Cloudinary public_id found:", image?.url);
    return;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      type: "upload",
    });

    console.log(`Cloudinary delete: ${publicId} → ${result.result}`);
  } catch (error) {
    console.error(`Cloudinary delete failed for ${publicId}:`, error.message);
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // =========================
    // FIND PRODUCT
    // =========================

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product is not exist",
      });
    }

    // =========================
    // GET DATA FROM REQUEST
    // =========================

    const { isMain, imageData, subCategory, ...productData } = req.body;

    // =========================
    // NORMAL PRODUCT FIELDS
    // =========================

    Object.assign(product, productData);

    product.subCategory = subCategory || undefined;

    // =========================
    // IMAGE DATA
    // =========================

    const parsedImageData = JSON.parse(imageData || "[]");

    const mainImageIndex = Number(isMain);

    const newFiles = req.files || [];

    let newFileIndex = 0;

    // =========================
    // FIND REMOVED OLD IMAGES
    // =========================

    const oldImages = Array.isArray(product.images) ? product.images : [];

    const keptImageIds = new Set(
      parsedImageData
        .filter((image) => image.type === "existing" && image._id)
        .map((image) => String(image._id)),
    );

    const removedImages = oldImages.filter(
      (oldImage) => !keptImageIds.has(String(oldImage._id)),
    );

    // =========================
    // BUILD FINAL IMAGES
    // =========================

    const finalImages = parsedImageData
      .map((image) => {
        // Existing image
        // if (image.type === "existing") {
        //   return {
        //     _id: image._id,
        //     url: image.url,
        //     isMain: image.index === mainImageIndex,
        //   };
        // }
        if (image.type === "existing") {
          const existingImage = oldImages.find(
            (oldImage) => String(oldImage._id) === String(image._id),
          );

          if (!existingImage) {
            return null;
          }

          return {
            _id: existingImage._id,
            url: existingImage.url,
            public_id:
              existingImage.public_id || getCloudinaryPublicId(existingImage),
            isMain: Number(image.index) === mainImageIndex,
          };
        }

        // New uploaded image
        // if (image.type === "new") {
        //   const file = newFiles[newFileIndex++];

        //   if (!file) {
        //     return null;
        //   }

        //   return {
        //     url: file.path,
        //     isMain: image.index === mainImageIndex,
        //   };
        // }
        if (image.type === "new") {
          const file = newFiles[newFileIndex++];

          if (!file) {
            return null;
          }

          return {
            url: file.secure_url || file.path,
            public_id: file.public_id || file.filename,
            isMain: Number(image.index) === mainImageIndex,
          };
        }

        return null;
      })
      .filter(Boolean);

    // =========================
    // UPDATE IMAGES
    // =========================

    product.images = finalImages;

    // =========================
    // SAVE PRODUCT FIRST
    // =========================

    const productUpdate = await product.save();

    // =========================
    // DELETE REMOVED FILES
    // =========================

    // for (const image of removedImages) {
    //   if (image.url) {
    //     await deleteFile(image.url);
    //   }
    // }
    for (const image of removedImages) {
      await deleteCloudinaryImage(image);
    }

    // =========================
    // RESPONSE
    // =========================

    return res.status(200).json({
      success: true,
      message: `Product update ${productUpdate.title} data`,
      data: productUpdate,
    });
  } catch (error) {
    console.log("Update Product error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
module.exports = {
  createProductController,
  // bulkCreateProductController,
  getAllProduct,
  deleteProduct,
  getSingleProduct,
  updateProduct,
};

const newsLetterModel = require("../model/newsLetterModel");

// Subscribe newsletter
const subscribeNewsletterController = async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Check existing subscriber
    const existingSubscriber = await newsLetterModel.findOne({
      email,
    });

    if (existingSubscriber) {
      if (existingSubscriber.status === "subscribed") {
        return res.status(200).json({
          success: true,
          message: "You are already subscribed!",
        });
      }

      // Allow previously unsubscribed users to subscribe again
      existingSubscriber.status = "subscribed";
      existingSubscriber.subscribedAt = new Date();

      await existingSubscriber.save();

      return res.status(200).json({
        success: true,
        message: "Welcome back! You are subscribed again.",
      });
    }

    // Create new subscriber
    const subscriber = await Newsletter.create({
      email,
      status: "subscribed",
    });

    return res.status(201).json({
      success: true,
      message: "Successfully subscribed to our newsletter!",
      data: subscriber,
    });
  } catch (error) {
    // Handle duplicate email race condition
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: "You are already subscribed!",
      });
    }

    console.error("Newsletter subscription error:", error);

    return res.status(500).json({
      success: false,
      message: "Newsletter subscription failed",
    });
  }
};

// Get newsletter subscribers (Admin)
const getNewsletterSubscribersController = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const search = String(req.query.search || "").trim();

    const filter = {};

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.email = {
        $regex: escapedSearch,
        $options: "i",
      };
    }

    const [subscribers, totalItems] = await Promise.all([
      Newsletter.find(filter)
        .select("email status subscribedAt createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Newsletter.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: subscribers,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    console.error("Get newsletter subscribers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscribers",
    });
  }
};

module.exports = {
  subscribeNewsletterController,
  getNewsletterSubscribersController,
};

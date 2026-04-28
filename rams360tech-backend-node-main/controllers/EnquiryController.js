import Enquiry from "../models/Enquiry.js";


// Create enquiry

export async function createEnquiry(req, res, next) {
  try {
    const {
      fullName,
      workEmail,
      company,
      role,
      country,
      enquiryType,
      message,
      consent,
    } = req.body;

    if (
      !fullName ||
      !workEmail ||
      !company ||
      !role ||
      !country ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message: "fullName, workEmail, company, role, country, and message are required",
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(workEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid work email format",
      });
    }

    if (consent !== true) {
      return res.status(400).json({
        success: false,
        message: "Consent is required",
      });
    }

    const enquiry = await Enquiry.create({
      fullName,
      workEmail,
      company,
      role,
      country,
      enquiryType: enquiryType || "Beta Access",
      message,
      consent,
    });

    return res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully",
      data: enquiry,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit enquiry",
      error: error.message,
    });
  }
};

// List enquiries with pagination + search
export async function getAllEnquiries(req, res, next) {
  try {
    const { search = "", page = 1, limit = 10, status } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { workEmail: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
        { enquiryType: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const total = await Enquiry.countDocuments(query);

    const enquiries = await Enquiry.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    return res.status(200).json({
      success: true,
      data: enquiries,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inquiries",
      error: error.message,
    });
  }
};

// Get single enquiry
export async function getEnquiryById(req, res, next) {
  try {
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch enquiry",
      error: error.message,
    });
  }
};

// Update enquiry
export async function updateEnquiry(req, res, next) {
  try {
    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedEnquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Enquiry updated successfully",
      data: updatedEnquiry,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update enquiry",
      error: error.message,
    });
  }
};

// Delete enquiry
export async function deleteEnquiry(req, res, next) {
  try {
    const deletedEnquiry = await Enquiry.findByIdAndDelete(req.params.id);

    if (!deletedEnquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Enquiry deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete enquiry",
      error: error.message,
    });
  }
};
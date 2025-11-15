import FundingRequest from '../models/FundingRequest.js';
import InvestorInterest from '../models/InvestorInterest.js';

export const createFundingRequest = async (req, res) => {
  try {
    if (req.user.role !== 'startup') {
      return res.status(403).json({ message: 'Only startups can create funding requests' });
    }

    const {
      title,
      description,
      fundingAmount,
      currency,
      stage,
      industry,
      pitchDeck,
      businessPlan,
      valuation,
      equityOffered,
      useOfFunds,
      milestones,
      team,
      revenue,
      customers,
    } = req.body;

    const fundingRequest = await FundingRequest.create({
      startup: req.user._id,
      title,
      description,
      fundingAmount,
      currency,
      stage,
      industry,
      pitchDeck,
      businessPlan,
      valuation,
      equityOffered,
      useOfFunds,
      milestones,
      team,
      revenue,
      customers,
    });

    const populated = await FundingRequest.findById(fundingRequest._id).populate(
      'startup',
      'name profilePhoto startupProfile.startupName'
    );

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFundingRequests = async (req, res) => {
  try {
    const {
      stage,
      industry,
      minAmount,
      maxAmount,
      status = 'open',
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const skip = (page - 1) * limit;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (stage) {
      query.stage = stage;
    }

    if (industry) {
      query.industry = { $regex: industry, $options: 'i' };
    }

    if (minAmount || maxAmount) {
      query.fundingAmount = {};
      if (minAmount) {
        query.fundingAmount.$gte = parseInt(minAmount);
      }
      if (maxAmount) {
        query.fundingAmount.$lte = parseInt(maxAmount);
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
      ];
    }

    const fundingRequests = await FundingRequest.find(query)
      .populate('startup', 'name profilePhoto startupProfile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FundingRequest.countDocuments(query);

    res.json({
      fundingRequests,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFundingRequest = async (req, res) => {
  try {
    const fundingRequest = await FundingRequest.findById(req.params.id)
      .populate('startup', 'name profilePhoto email startupProfile')
      .populate({
        path: 'interests',
        populate: {
          path: 'investor',
          select: 'name profilePhoto email investorProfile',
        },
      });

    if (!fundingRequest) {
      return res.status(404).json({ message: 'Funding request not found' });
    }

    fundingRequest.views += 1;
    await fundingRequest.save();

    res.json(fundingRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyFundingRequests = async (req, res) => {
  try {
    const fundingRequests = await FundingRequest.find({ startup: req.user._id })
      .populate({
        path: 'interests',
        populate: {
          path: 'investor',
          select: 'name profilePhoto investorProfile',
        },
      })
      .sort({ createdAt: -1 });

    res.json(fundingRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateFundingRequest = async (req, res) => {
  try {
    const fundingRequest = await FundingRequest.findById(req.params.id);

    if (!fundingRequest) {
      return res.status(404).json({ message: 'Funding request not found' });
    }

    if (fundingRequest.startup.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this funding request' });
    }

    const updatedFields = req.body;
    Object.keys(updatedFields).forEach((key) => {
      fundingRequest[key] = updatedFields[key];
    });

    await fundingRequest.save();

    const populated = await FundingRequest.findById(fundingRequest._id).populate(
      'startup',
      'name profilePhoto startupProfile'
    );

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFundingRequest = async (req, res) => {
  try {
    const fundingRequest = await FundingRequest.findById(req.params.id);

    if (!fundingRequest) {
      return res.status(404).json({ message: 'Funding request not found' });
    }

    if (fundingRequest.startup.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this funding request' });
    }

    await InvestorInterest.deleteMany({ fundingRequest: fundingRequest._id });
    await fundingRequest.deleteOne();

    res.json({ message: 'Funding request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

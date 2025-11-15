import InvestorInterest from '../models/InvestorInterest.js';
import FundingRequest from '../models/FundingRequest.js';
import { createNotification } from './notificationController.js';
import { getIO } from '../socket/socketHandler.js';

export const expressInterest = async (req, res) => {
  try {
    if (req.user.role !== 'investor') {
      return res.status(403).json({ message: 'Only investors can express interest' });
    }

    const { fundingRequestId, message, proposedAmount, proposedEquity, terms } = req.body;

    const fundingRequest = await FundingRequest.findById(fundingRequestId);

    if (!fundingRequest) {
      return res.status(404).json({ message: 'Funding request not found' });
    }

    if (fundingRequest.status !== 'open') {
      return res.status(400).json({ message: 'This funding request is no longer open' });
    }

    const existingInterest = await InvestorInterest.findOne({
      fundingRequest: fundingRequestId,
      investor: req.user._id,
    });

    if (existingInterest) {
      return res.status(400).json({ message: 'You have already expressed interest in this funding request' });
    }

    const interest = await InvestorInterest.create({
      fundingRequest: fundingRequestId,
      investor: req.user._id,
      message,
      proposedAmount,
      proposedEquity,
      terms,
    });

    fundingRequest.interests.push(interest._id);
    await fundingRequest.save();

    const populatedInterest = await InvestorInterest.findById(interest._id)
      .populate('investor', 'name profilePhoto email investorProfile')
      .populate('fundingRequest', 'title fundingAmount');

    const notification = await createNotification({
      recipient: fundingRequest.startup,
      sender: req.user._id,
      type: 'investor_interest',
      message: `${req.user.name} expressed interest in your funding request: ${fundingRequest.title}`,
      link: `/funding/${fundingRequestId}`,
    });

    if (notification) {
      const io = getIO();
      io.to(fundingRequest.startup.toString()).emit('newNotification', notification);
    }

    res.status(201).json(populatedInterest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyInterests = async (req, res) => {
  try {
    const interests = await InvestorInterest.find({ investor: req.user._id })
      .populate('fundingRequest')
      .populate({
        path: 'fundingRequest',
        populate: {
          path: 'startup',
          select: 'name profilePhoto startupProfile',
        },
      })
      .sort({ createdAt: -1 });

    res.json(interests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFundingInterests = async (req, res) => {
  try {
    const fundingRequest = await FundingRequest.findById(req.params.fundingRequestId);

    if (!fundingRequest) {
      return res.status(404).json({ message: 'Funding request not found' });
    }

    if (fundingRequest.startup.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these interests' });
    }

    const interests = await InvestorInterest.find({ fundingRequest: req.params.fundingRequestId })
      .populate('investor', 'name profilePhoto email investorProfile')
      .sort({ createdAt: -1 });

    res.json(interests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInterestStatus = async (req, res) => {
  try {
    const { status, meetingDate, notes } = req.body;
    const interest = await InvestorInterest.findById(req.params.id).populate('fundingRequest');

    if (!interest) {
      return res.status(404).json({ message: 'Interest not found' });
    }

    const isStartup = interest.fundingRequest.startup.toString() === req.user._id.toString();
    const isInvestor = interest.investor.toString() === req.user._id.toString();

    if (!isStartup && !isInvestor) {
      return res.status(403).json({ message: 'Not authorized to update this interest' });
    }

    if (status) {
      interest.status = status;
    }

    if (meetingDate) {
      interest.meetingDate = meetingDate;
    }

    if (notes) {
      interest.notes = notes;
    }

    await interest.save();

    const recipientId = isStartup ? interest.investor : interest.fundingRequest.startup;

    const notification = await createNotification({
      recipient: recipientId,
      sender: req.user._id,
      type: 'investor_interest',
      message: `Interest status updated to: ${status}`,
      link: `/funding/${interest.fundingRequest._id}`,
    });

    if (notification) {
      const io = getIO();
      io.to(recipientId.toString()).emit('newNotification', notification);
    }

    res.json(interest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteInterest = async (req, res) => {
  try {
    const interest = await InvestorInterest.findById(req.params.id);

    if (!interest) {
      return res.status(404).json({ message: 'Interest not found' });
    }

    if (interest.investor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this interest' });
    }

    await FundingRequest.findByIdAndUpdate(interest.fundingRequest, {
      $pull: { interests: interest._id },
    });

    await interest.deleteOne();

    res.json({ message: 'Interest withdrawn successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

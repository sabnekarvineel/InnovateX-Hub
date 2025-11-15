import User from '../models/User.js';
import Post from '../models/Post.js';
import Job from '../models/Job.js';
import FundingRequest from '../models/FundingRequest.js';
import Application from '../models/Application.js';
import InvestorInterest from '../models/InvestorInterest.js';
import Message from '../models/Message.js';

export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const totalPosts = await Post.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalFundingRequests = await FundingRequest.countDocuments();
    const totalApplications = await Application.countDocuments();
    const totalInvestorInterests = await InvestorInterest.countDocuments();

    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const bannedUsers = await User.countDocuments({ isBanned: true });

    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    const activeUsers = await Post.aggregate([
      {
        $group: {
          _id: '$author',
          postCount: { $sum: 1 },
        },
      },
      { $sort: { postCount: -1 } },
      { $limit: 10 },
    ]);

    const populatedActiveUsers = await User.populate(activeUsers, {
      path: '_id',
      select: 'name profilePhoto role',
    });

    res.json({
      totalUsers,
      usersByRole,
      totalPosts,
      totalJobs,
      totalFundingRequests,
      totalApplications,
      totalInvestorInterests,
      verifiedUsers,
      bannedUsers,
      recentUsers,
      activeUsers: populatedActiveUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { role, verified, banned, search, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (role) {
      query.role = role;
    }

    if (verified !== undefined) {
      query.isVerified = verified === 'true';
    }

    if (banned !== undefined) {
      query.isBanned = banned === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = true;
    await user.save();

    res.json({ message: `${user.name} has been verified`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unverifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = false;
    await user.save();

    res.json({ message: `${user.name} has been unverified`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const banUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot ban admin users' });
    }

    user.isBanned = true;
    user.bannedReason = reason || 'Violated platform policies';
    await user.save();

    res.json({ message: `${user.name} has been banned`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBanned = false;
    user.bannedReason = '';
    await user.save();

    res.json({ message: `${user.name} has been unbanned`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    await Post.deleteMany({ author: user._id });
    await Job.deleteMany({ postedBy: user._id });
    await FundingRequest.deleteMany({ startup: user._id });
    await Application.deleteMany({ applicant: user._id });
    await InvestorInterest.deleteMany({ investor: user._id });
    
    await user.deleteOne();

    res.json({ message: 'User and all associated data deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('author', 'name profilePhoto role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments();

    res.json({
      posts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.deleteOne();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

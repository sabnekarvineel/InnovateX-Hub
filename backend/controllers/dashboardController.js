import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import FundingRequest from '../models/FundingRequest.js';
import InvestorInterest from '../models/InvestorInterest.js';
import Post from '../models/Post.js';

export const getStudentDashboard = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job')
      .limit(5)
      .sort({ createdAt: -1 });

    const suggestedJobs = await Job.find({
      type: { $in: ['internship', 'job'] },
      status: 'open',
      skillsRequired: { $in: req.user.skills || [] },
    })
      .populate('postedBy', 'name profilePhoto startupProfile.startupName')
      .limit(6)
      .sort({ createdAt: -1 });

    const recentPosts = await Post.find({ author: req.user._id })
      .limit(5)
      .sort({ createdAt: -1 });

    const stats = {
      totalApplications: await Application.countDocuments({ applicant: req.user._id }),
      pendingApplications: await Application.countDocuments({ 
        applicant: req.user._id, 
        status: 'pending' 
      }),
      acceptedApplications: await Application.countDocuments({ 
        applicant: req.user._id, 
        status: 'accepted' 
      }),
      followers: req.user.followers?.length || 0,
    };

    res.json({
      applications,
      suggestedJobs,
      recentPosts,
      stats,
      skills: req.user.skills || [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFreelancerDashboard = async (req, res) => {
  try {
    const myJobs = await Job.find({ postedBy: req.user._id })
      .populate('applications')
      .limit(5)
      .sort({ createdAt: -1 });

    const applications = await Application.find({ applicant: req.user._id })
      .populate('job')
      .limit(5)
      .sort({ createdAt: -1 });

    const suggestedProjects = await Job.find({
      type: { $in: ['freelance', 'project'] },
      status: 'open',
      skillsRequired: { $in: req.user.skills || [] },
    })
      .populate('postedBy', 'name profilePhoto')
      .limit(6)
      .sort({ createdAt: -1 });

    const stats = {
      activeProjects: await Job.countDocuments({ 
        postedBy: req.user._id, 
        status: { $in: ['open', 'in-progress'] } 
      }),
      totalApplications: await Application.countDocuments({ applicant: req.user._id }),
      servicesPosted: await Job.countDocuments({ postedBy: req.user._id }),
      averageRating: req.user.freelancerProfile?.ratings?.length > 0
        ? req.user.freelancerProfile.ratings.reduce((sum, r) => sum + r.rating, 0) / 
          req.user.freelancerProfile.ratings.length
        : 0,
    };

    res.json({
      myJobs,
      applications,
      suggestedProjects,
      stats,
      hourlyRate: req.user.freelancerProfile?.hourlyRate || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStartupDashboard = async (req, res) => {
  try {
    const myJobs = await Job.find({ postedBy: req.user._id })
      .populate('applications')
      .limit(5)
      .sort({ createdAt: -1 });

    const myFundingRequests = await FundingRequest.find({ startup: req.user._id })
      .populate('interests')
      .limit(3)
      .sort({ createdAt: -1 });

    const totalApplications = await Job.aggregate([
      { $match: { postedBy: req.user._id } },
      { $project: { applicationCount: { $size: '$applications' } } },
      { $group: { _id: null, total: { $sum: '$applicationCount' } } },
    ]);

    const totalInterests = await FundingRequest.aggregate([
      { $match: { startup: req.user._id } },
      { $project: { interestCount: { $size: '$interests' } } },
      { $group: { _id: null, total: { $sum: '$interestCount' } } },
    ]);

    const stats = {
      activeJobs: await Job.countDocuments({ 
        postedBy: req.user._id, 
        status: 'open' 
      }),
      totalApplications: totalApplications.length > 0 ? totalApplications[0].total : 0,
      fundingRequests: await FundingRequest.countDocuments({ startup: req.user._id }),
      investorInterests: totalInterests.length > 0 ? totalInterests[0].total : 0,
    };

    res.json({
      myJobs,
      myFundingRequests,
      stats,
      startupProfile: req.user.startupProfile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInvestorDashboard = async (req, res) => {
  try {
    const myInterests = await InvestorInterest.find({ investor: req.user._id })
      .populate('fundingRequest')
      .populate({
        path: 'fundingRequest',
        populate: {
          path: 'startup',
          select: 'name profilePhoto startupProfile',
        },
      })
      .limit(5)
      .sort({ createdAt: -1 });

    const recommendedStartups = await FundingRequest.find({
      status: 'open',
      industry: { $in: req.user.investorProfile?.investmentFocus || [] },
    })
      .populate('startup', 'name profilePhoto startupProfile')
      .limit(6)
      .sort({ createdAt: -1 });

    const stats = {
      totalInterests: await InvestorInterest.countDocuments({ investor: req.user._id }),
      activeDeals: await InvestorInterest.countDocuments({ 
        investor: req.user._id, 
        status: { $in: ['meeting-scheduled', 'due-diligence', 'negotiating'] } 
      }),
      completedDeals: await InvestorInterest.countDocuments({ 
        investor: req.user._id, 
        status: 'accepted' 
      }),
      portfolioSize: req.user.investorProfile?.portfolio?.length || 0,
    };

    res.json({
      myInterests,
      recommendedStartups,
      stats,
      investmentFocus: req.user.investorProfile?.investmentFocus || [],
      investmentRange: req.user.investorProfile?.investmentRange,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardOverview = async (req, res) => {
  try {
    const role = req.user.role;

    switch (role) {
      case 'student':
        return await getStudentDashboard(req, res);
      case 'freelancer':
        return await getFreelancerDashboard(req, res);
      case 'startup':
        return await getStartupDashboard(req, res);
      case 'investor':
        return await getInvestorDashboard(req, res);
      default:
        return res.status(400).json({ message: 'Invalid user role' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

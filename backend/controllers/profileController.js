import User from '../models/User.js';
import { createNotification } from './notificationController.js';
import { getIO } from '../socket/socketHandler.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'name profilePhoto')
      .populate('following', 'name profilePhoto');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      name,
      bio,
      location,
      skills,
      socialLinks,
      studentProfile,
      freelancerProfile,
      startupProfile,
      investorProfile,
    } = req.body;

    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (location) user.location = location;
    if (skills) user.skills = skills;
    if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };

    if (user.role === 'student' && studentProfile) {
      user.studentProfile = { ...user.studentProfile, ...studentProfile };
    }

    if (user.role === 'freelancer' && freelancerProfile) {
      user.freelancerProfile = { ...user.freelancerProfile, ...freelancerProfile };
    }

    if (user.role === 'startup' && startupProfile) {
      user.startupProfile = { ...user.startupProfile, ...startupProfile };
    }

    if (user.role === 'investor' && investorProfile) {
      user.investorProfile = { ...user.investorProfile, ...investorProfile };
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profilePhoto: updatedUser.profilePhoto,
      coverBanner: updatedUser.coverBanner,
      bio: updatedUser.bio,
      location: updatedUser.location,
      skills: updatedUser.skills,
      socialLinks: updatedUser.socialLinks,
      studentProfile: updatedUser.studentProfile,
      freelancerProfile: updatedUser.freelancerProfile,
      startupProfile: updatedUser.startupProfile,
      investorProfile: updatedUser.investorProfile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    user.profilePhoto = req.file.path;
    await user.save();

    res.json({
      message: 'Profile photo uploaded successfully',
      profilePhoto: user.profilePhoto,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadCoverBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    user.coverBanner = req.file.path;
    await user.save();

    res.json({
      message: 'Cover banner uploaded successfully',
      coverBanner: user.coverBanner,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    currentUser.following.push(req.params.id);
    userToFollow.followers.push(req.user._id);

    await currentUser.save();
    await userToFollow.save();

    const notification = await createNotification({
      recipient: req.params.id,
      sender: req.user._id,
      type: 'follow',
      message: `${currentUser.name} started following you`,
      link: `/profile/${req.user._id}`,
    });

    if (notification) {
      const io = getIO();
      io.to(req.params.id).emit('newNotification', notification);
    }

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: 'Not following this user' });
    }

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== req.params.id
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== req.user._id.toString()
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      'followers',
      'name profilePhoto bio role'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.followers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      'following',
      'name profilePhoto bio role'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.following);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

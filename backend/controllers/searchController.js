import User from '../models/User.js';
import Post from '../models/Post.js';

export const searchUsers = async (req, res) => {
  try {
    const {
      query,
      role,
      location,
      skills,
      minInvestment,
      maxInvestment,
      minHourlyRate,
      maxHourlyRate,
      startupStage,
      services,
      page = 1,
      limit = 20,
    } = req.query;

    const skip = (page - 1) * limit;
    let searchQuery = {};

    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
        { 'startupProfile.startupName': { $regex: query, $options: 'i' } },
        { 'startupProfile.mission': { $regex: query, $options: 'i' } },
      ];
    }

    if (role) {
      searchQuery.role = role;
    }

    if (location) {
      searchQuery.location = { $regex: location, $options: 'i' };
    }

    if (skills) {
      const skillsArray = skills.split(',');
      searchQuery.skills = { $in: skillsArray };
    }

    if (role === 'investor') {
      if (minInvestment || maxInvestment) {
        searchQuery['investorProfile.investmentRange.min'] = {};
        if (minInvestment) {
          searchQuery['investorProfile.investmentRange.min'].$gte = parseInt(minInvestment);
        }
        if (maxInvestment) {
          searchQuery['investorProfile.investmentRange.max'] = {};
          searchQuery['investorProfile.investmentRange.max'].$lte = parseInt(maxInvestment);
        }
      }
    }

    if (role === 'freelancer') {
      if (minHourlyRate || maxHourlyRate) {
        searchQuery['freelancerProfile.hourlyRate'] = {};
        if (minHourlyRate) {
          searchQuery['freelancerProfile.hourlyRate'].$gte = parseInt(minHourlyRate);
        }
        if (maxHourlyRate) {
          searchQuery['freelancerProfile.hourlyRate'].$lte = parseInt(maxHourlyRate);
        }
      }

      if (services) {
        const servicesArray = services.split(',');
        searchQuery['freelancerProfile.services'] = { $in: servicesArray };
      }
    }

    if (role === 'startup' && startupStage) {
      searchQuery['startupProfile.stage'] = startupStage;
    }

    const users = await User.find(searchQuery)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(searchQuery);

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

export const searchBySkill = async (req, res) => {
  try {
    const { skill } = req.query;

    if (!skill) {
      return res.status(400).json({ message: 'Skill parameter is required' });
    }

    const users = await User.find({
      skills: { $regex: skill, $options: 'i' },
    }).select('name profilePhoto role skills bio location');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchProjects = async (req, res) => {
  try {
    const { query, technology } = req.query;

    let searchQuery = {
      role: 'student',
      'studentProfile.projects': { $exists: true, $ne: [] },
    };

    const users = await User.find(searchQuery).select(
      'name profilePhoto studentProfile.projects'
    );

    let allProjects = [];
    users.forEach((user) => {
      if (user.studentProfile && user.studentProfile.projects) {
        user.studentProfile.projects.forEach((project) => {
          let matches = true;

          if (query) {
            const regex = new RegExp(query, 'i');
            matches =
              regex.test(project.title) ||
              regex.test(project.description);
          }

          if (technology && matches) {
            matches = project.technologies?.some((tech) =>
              new RegExp(technology, 'i').test(tech)
            );
          }

          if (matches) {
            allProjects.push({
              ...project.toObject(),
              student: {
                _id: user._id,
                name: user.name,
                profilePhoto: user.profilePhoto,
              },
            });
          }
        });
      }
    });

    res.json(allProjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchStartups = async (req, res) => {
  try {
    const { query, stage, minFunding, maxFunding } = req.query;

    let searchQuery = {
      role: 'startup',
    };

    if (query) {
      searchQuery.$or = [
        { 'startupProfile.startupName': { $regex: query, $options: 'i' } },
        { 'startupProfile.mission': { $regex: query, $options: 'i' } },
      ];
    }

    if (stage) {
      searchQuery['startupProfile.stage'] = stage;
    }

    if (minFunding || maxFunding) {
      searchQuery['startupProfile.fundingRequirements.amount'] = {};
      if (minFunding) {
        searchQuery['startupProfile.fundingRequirements.amount'].$gte = parseInt(minFunding);
      }
      if (maxFunding) {
        searchQuery['startupProfile.fundingRequirements.amount'].$lte = parseInt(maxFunding);
      }
    }

    const startups = await User.find(searchQuery).select(
      'name profilePhoto bio location startupProfile'
    );

    res.json(startups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchFreelancers = async (req, res) => {
  try {
    const { query, service, minRate, maxRate } = req.query;

    let searchQuery = {
      role: 'freelancer',
    };

    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
        { skills: { $regex: query, $options: 'i' } },
      ];
    }

    if (service) {
      searchQuery['freelancerProfile.services'] = { $regex: service, $options: 'i' };
    }

    if (minRate || maxRate) {
      searchQuery['freelancerProfile.hourlyRate'] = {};
      if (minRate) {
        searchQuery['freelancerProfile.hourlyRate'].$gte = parseInt(minRate);
      }
      if (maxRate) {
        searchQuery['freelancerProfile.hourlyRate'].$lte = parseInt(maxRate);
      }
    }

    const freelancers = await User.find(searchQuery).select(
      'name profilePhoto bio location skills freelancerProfile'
    );

    res.json(freelancers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAvailableSkills = async (req, res) => {
  try {
    const skills = await User.distinct('skills');
    res.json(skills.filter((skill) => skill));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAvailableLocations = async (req, res) => {
  try {
    const locations = await User.distinct('location');
    res.json(locations.filter((location) => location));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

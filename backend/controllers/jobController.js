import Job from '../models/Job.js';
import Application from '../models/Application.js';

export const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      category,
      skillsRequired,
      experienceLevel,
      location,
      locationType,
      budget,
      duration,
      deadline,
    } = req.body;

    const job = await Job.create({
      postedBy: req.user._id,
      title,
      description,
      type,
      category,
      skillsRequired,
      experienceLevel,
      location,
      locationType,
      budget,
      duration,
      deadline,
    });

    const populatedJob = await Job.findById(job._id).populate(
      'postedBy',
      'name profilePhoto role startupProfile.startupName'
    );

    res.status(201).json(populatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobs = async (req, res) => {
  try {
    const {
      type,
      category,
      experienceLevel,
      locationType,
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

    if (type) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    if (locationType) {
      query.locationType = locationType;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skillsRequired: { $regex: search, $options: 'i' } },
      ];
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'name profilePhoto role startupProfile.startupName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name profilePhoto role email startupProfile.startupName')
      .populate({
        path: 'applications',
        populate: {
          path: 'applicant',
          select: 'name profilePhoto role email',
        },
      });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    job.views += 1;
    await job.save();

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id })
      .populate('applications')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const updatedFields = req.body;
    Object.keys(updatedFields).forEach((key) => {
      job[key] = updatedFields[key];
    });

    await job.save();

    const populatedJob = await Job.findById(job._id).populate(
      'postedBy',
      'name profilePhoto role'
    );

    res.json(populatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Application.deleteMany({ job: job._id });
    await job.deleteOne();

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

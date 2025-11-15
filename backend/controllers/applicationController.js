import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { createNotification } from './notificationController.js';
import { getIO } from '../socket/socketHandler.js';

export const applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter, resume, portfolio, proposedRate } = req.body;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      coverLetter,
      resume,
      portfolio,
      proposedRate,
    });

    job.applications.push(application._id);
    await job.save();

    const populatedApplication = await Application.findById(application._id)
      .populate('applicant', 'name profilePhoto role email')
      .populate('job', 'title type');

    const notification = await createNotification({
      recipient: job.postedBy,
      sender: req.user._id,
      type: 'investor_interest',
      message: `${req.user.name} applied for your ${job.type}: ${job.title}`,
      link: `/jobs/${jobId}`,
    });

    if (notification) {
      const io = getIO();
      io.to(job.postedBy.toString()).emit('newNotification', notification);
    }

    res.status(201).json(populatedApplication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job')
      .populate({
        path: 'job',
        populate: {
          path: 'postedBy',
          select: 'name profilePhoto role startupProfile.startupName',
        },
      })
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these applications' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name profilePhoto role email skills bio')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    if (notes) {
      application.notes = notes;
    }

    await application.save();

    const notification = await createNotification({
      recipient: application.applicant,
      sender: req.user._id,
      type: 'investor_interest',
      message: `Your application status has been updated to: ${status}`,
      link: `/applications`,
    });

    if (notification) {
      const io = getIO();
      io.to(application.applicant.toString()).emit('newNotification', notification);
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this application' });
    }

    await Job.findByIdAndUpdate(application.job, {
      $pull: { applications: application._id },
    });

    await application.deleteOne();

    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

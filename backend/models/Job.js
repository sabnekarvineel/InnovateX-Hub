import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    type: {
      type: String,
      enum: ['job', 'internship', 'freelance', 'project'],
      required: true,
    },
    category: {
      type: String,
      enum: [
        'web-development',
        'mobile-development',
        'design',
        'marketing',
        'data-science',
        'ai-ml',
        'blockchain',
        'devops',
        'other',
      ],
      required: true,
    },
    skillsRequired: [{
      type: String,
    }],
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert'],
      default: 'beginner',
    },
    location: {
      type: String,
      default: '',
    },
    locationType: {
      type: String,
      enum: ['remote', 'onsite', 'hybrid'],
      default: 'remote',
    },
    budget: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD',
      },
    },
    duration: {
      value: Number,
      unit: {
        type: String,
        enum: ['hours', 'days', 'weeks', 'months'],
        default: 'months',
      },
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'in-progress', 'completed'],
      default: 'open',
    },
    applications: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
    }],
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ postedBy: 1, createdAt: -1 });
jobSchema.index({ type: 1, category: 1 });
jobSchema.index({ status: 1 });

export default mongoose.model('Job', jobSchema);

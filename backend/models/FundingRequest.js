import mongoose from 'mongoose';

const fundingRequestSchema = new mongoose.Schema(
  {
    startup: {
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
    fundingAmount: {
      type: Number,
      required: [true, 'Please add funding amount'],
    },
    currency: {
      type: String,
      default: 'USD',
    },
    stage: {
      type: String,
      enum: ['idea', 'seed', 'series-a', 'series-b', 'series-c', 'series-d'],
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    pitchDeck: {
      type: String,
      default: '',
    },
    businessPlan: {
      type: String,
      default: '',
    },
    valuation: {
      type: Number,
    },
    equityOffered: {
      type: Number,
      min: 0,
      max: 100,
    },
    useOfFunds: {
      type: String,
    },
    milestones: [{
      title: String,
      description: String,
      targetDate: Date,
      completed: {
        type: Boolean,
        default: false,
      },
    }],
    team: [{
      name: String,
      role: String,
      linkedin: String,
    }],
    revenue: {
      current: Number,
      projected: Number,
    },
    customers: {
      current: Number,
      projected: Number,
    },
    interests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InvestorInterest',
    }],
    status: {
      type: String,
      enum: ['open', 'in-negotiation', 'funded', 'closed'],
      default: 'open',
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

fundingRequestSchema.index({ startup: 1, createdAt: -1 });
fundingRequestSchema.index({ status: 1, stage: 1 });

export default mongoose.model('FundingRequest', fundingRequestSchema);

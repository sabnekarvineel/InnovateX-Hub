import mongoose from 'mongoose';

const investorInterestSchema = new mongoose.Schema(
  {
    fundingRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FundingRequest',
      required: true,
    },
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Please add a message'],
      maxlength: 1000,
    },
    proposedAmount: {
      type: Number,
    },
    proposedEquity: {
      type: Number,
      min: 0,
      max: 100,
    },
    terms: {
      type: String,
    },
    status: {
      type: String,
      enum: ['interested', 'meeting-scheduled', 'due-diligence', 'negotiating', 'accepted', 'rejected'],
      default: 'interested',
    },
    meetingDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

investorInterestSchema.index({ fundingRequest: 1, investor: 1 }, { unique: true });
investorInterestSchema.index({ investor: 1, createdAt: -1 });

export default mongoose.model('InvestorInterest', investorInterestSchema);

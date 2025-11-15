import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'freelancer', 'startup', 'investor', 'admin'],
      required: [true, 'Please select a role'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    bannedReason: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    coverBanner: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: 500,
    },
    location: {
      type: String,
      default: '',
    },
    skills: [{
      type: String,
    }],
    socialLinks: {
      website: { type: String, default: '' },
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
    },
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    studentProfile: {
      education: [{
        institution: String,
        degree: String,
        field: String,
        startYear: Number,
        endYear: Number,
      }],
      projects: [{
        title: String,
        description: String,
        link: String,
        technologies: [String],
      }],
      resume: String,
      lookingForInternships: {
        type: Boolean,
        default: false,
      },
    },
    freelancerProfile: {
      services: [{
        type: String,
      }],
      hourlyRate: {
        type: Number,
        default: 0,
      },
      portfolio: [{
        title: String,
        description: String,
        link: String,
        images: [String],
      }],
      ratings: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        review: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      }],
    },
    startupProfile: {
      startupName: String,
      mission: String,
      stage: {
        type: String,
        enum: ['idea', 'seed', 'series-a', 'series-b', 'series-c'],
      },
      pitchDeck: String,
      fundingRequirements: {
        amount: Number,
        currency: {
          type: String,
          default: 'USD',
        },
      },
      teamMembers: [{
        name: String,
        role: String,
        linkedin: String,
      }],
      openPositions: [{
        title: String,
        type: {
          type: String,
          enum: ['job', 'internship'],
        },
        description: String,
        requirements: [String],
        postedAt: {
          type: Date,
          default: Date.now,
        },
      }],
    },
    investorProfile: {
      investmentFocus: [{
        type: String,
      }],
      investmentRange: {
        min: Number,
        max: Number,
        currency: {
          type: String,
          default: 'USD',
        },
      },
      portfolio: [{
        startupName: String,
        startupId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        investmentAmount: Number,
        investmentDate: Date,
      }],
      fundingHistory: [{
        startup: String,
        amount: Number,
        date: Date,
        round: String,
      }],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);

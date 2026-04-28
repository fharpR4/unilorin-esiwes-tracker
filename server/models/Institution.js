const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Institution name is required.'],
      unique: true,
      trim: true,
      maxlength: [200, 'Institution name cannot exceed 200 characters.'],
    },
    acronym: {
      type: String,
      uppercase: true,
      trim: true,
      maxlength: [20, 'Acronym cannot exceed 20 characters.'],
    },
    type: {
      type: String,
      enum: {
        values: ['university', 'polytechnic', 'college_of_education', 'other'],
        message: '{VALUE} is not a valid institution type.',
      },
      default: 'university',
    },
    address: {
      city: {
        type: String,
        trim: true,
        default: 'Ilorin',
      },
      state: {
        type: String,
        trim: true,
        default: 'Kwara',
      },
      country: {
        type: String,
        trim: true,
        default: 'Nigeria',
      },
    },
    logoUrl: {
      type: String,
      default: '/assets/unilorin-logo.svg',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for active institution lookup
institutionSchema.index({ isActive: 1 });

module.exports = mongoose.model('Institution', institutionSchema);
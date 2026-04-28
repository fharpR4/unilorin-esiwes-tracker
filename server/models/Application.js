const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required.'],
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Supervisor reference is required.'],
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: [true, 'Institution reference is required.'],
    },
    coordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Assigned by admin or auto-assigned based on institution
    },

    // ---- ORGANIZATION DETAILS ----
    organizationName: {
      type: String,
      required: [true, 'Organization name is required.'],
      trim: true,
      maxlength: [200, 'Organization name cannot exceed 200 characters.'],
    },
    organizationAddress: {
      street: {
        type: String,
        trim: true,
        maxlength: [200, 'Street address cannot exceed 200 characters.'],
      },
      city: {
        type: String,
        trim: true,
        maxlength: [100, 'City cannot exceed 100 characters.'],
      },
      state: {
        type: String,
        trim: true,
        maxlength: [100, 'State cannot exceed 100 characters.'],
      },
      country: {
        type: String,
        trim: true,
        default: 'Nigeria',
      },
    },

    // ---- TIMELINE ----
    startDate: {
      type: Date,
      required: [true, 'Training start date is required.'],
    },
    expectedEndDate: {
      type: Date,
      required: [true, 'Expected end date is required.'],
    },
    actualEndDate: {
      type: Date,
    },
    totalDaysRequired: {
      type: Number,
      default: 90,
      min: [1, 'Total days required must be at least 1.'],
    },

    // ---- STATUS WORKFLOW ----
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected', 'completed'],
        message: '{VALUE} is not a valid application status.',
      },
      default: 'pending',
    },
    coordinatorComment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Coordinator comment cannot exceed 1000 characters.'],
    },
    approvedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },

    // ---- SUPERVISOR DETAILS (name/email in case supervisor is not yet registered) ----
    supervisorName: {
      type: String,
      trim: true,
      maxlength: [100, 'Supervisor name cannot exceed 100 characters.'],
    },
    supervisorEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    supervisorPhone: {
      type: String,
      trim: true,
    },
    supervisorTitle: {
      type: String,
      trim: true,
      maxlength: [100, 'Supervisor title cannot exceed 100 characters.'],
    },
  },
  {
    timestamps: true,
  }
);

// ---- INDEXES ----
applicationSchema.index({ student: 1, status: 1 });
applicationSchema.index({ supervisor: 1 });
applicationSchema.index({ coordinator: 1, status: 1 });
applicationSchema.index({ institution: 1, status: 1 });

// ---- VALIDATION: expectedEndDate must be after startDate ----
applicationSchema.pre('save', function (next) {
  if (this.startDate && this.expectedEndDate) {
    if (this.expectedEndDate <= this.startDate) {
      const err = new Error('Expected end date must be after the start date.');
      err.name = 'ValidationError';
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
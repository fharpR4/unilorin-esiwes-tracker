const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Project title is required.'],
      trim: true,
      maxlength: [300, 'Project title cannot exceed 300 characters.'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required.'],
      minlength: [30, 'Project description must be at least 30 characters.'],
      maxlength: [2000, 'Project description cannot exceed 2000 characters.'],
      trim: true,
    },
    objectives: [
      {
        type: String,
        trim: true,
        maxlength: 300,
      },
    ],
    techStack: [
      {
        type: String,
        trim: true,
        maxlength: 50,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'revision_requested'],
      default: 'pending',
    },
    supervisorComment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    approvedAt: Date,
    rejectedAt: Date,
  },
  { timestamps: true }
);

projectSchema.index({ student: 1 });
projectSchema.index({ supervisor: 1, status: 1 });
projectSchema.index({ application: 1 });

module.exports = mongoose.model('Project', projectSchema);
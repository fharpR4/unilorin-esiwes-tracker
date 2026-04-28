const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
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
    },
    weekNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    summary: {
      type: String,
      required: [true, 'Weekly summary is required.'],
      minlength: [100, 'Summary must be at least 100 characters.'],
      maxlength: [5000, 'Summary cannot exceed 5000 characters.'],
      trim: true,
    },
    accomplishments: [
      {
        type: String,
        trim: true,
        maxlength: 500,
      },
    ],
    nextWeekPlan: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    daysAttended: {
      type: Number,
      default: 0,
      min: 0,
      max: 7,
    },
    logsCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'reviewed'],
      default: 'draft',
    },
    supervisorFeedback: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    submittedAt: Date,
  },
  { timestamps: true }
);

reportSchema.index({ student: 1, weekNumber: 1 }, { unique: true });
reportSchema.index({ supervisor: 1, status: 1 });

module.exports = mongoose.model('Report', reportSchema);
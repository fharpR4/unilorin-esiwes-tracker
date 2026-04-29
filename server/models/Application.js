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
      required: [true, 'Supervisor is required.'],
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: [true, 'Institution is required.'],
    },
    coordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    organizationName: {
      type: String,
      required: [true, 'Organization name is required.'],
      trim: true,
      maxlength: 200,
    },
    organizationAddress: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true, default: 'Nigeria' },
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required.'],
    },
    expectedEndDate: {
      type: Date,
      required: [true, 'Expected end date is required.'],
    },
    actualEndDate: { type: Date },
    // No hard cap — students can log beyond 90 days
    totalDaysRequired: {
      type: Number,
      default: 90,
      min: 1,
    },
    // Student can exceed totalDaysRequired — no enforcement
    allowExceedDays: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    coordinatorComment: { type: String, trim: true, maxlength: 1000 },
    approvedAt: Date,
    rejectedAt: Date,
    supervisorName: { type: String, trim: true },
    supervisorEmail: { type: String, trim: true, lowercase: true },
    supervisorPhone: { type: String, trim: true },
    supervisorTitle: { type: String, trim: true },
  },
  { timestamps: true }
);

applicationSchema.index({ student: 1, status: 1 });
applicationSchema.index({ supervisor: 1 });
applicationSchema.index({ coordinator: 1, status: 1 });
applicationSchema.index({ institution: 1, status: 1 });

applicationSchema.pre('save', function (next) {
  if (this.startDate && this.expectedEndDate && this.expectedEndDate <= this.startDate) {
    return next(new Error('Expected end date must be after start date.'));
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
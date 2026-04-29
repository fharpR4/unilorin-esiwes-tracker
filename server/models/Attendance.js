const mongoose = require('mongoose');

const geoPointSchema = {
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    default: undefined,
  },
  accuracy: Number,
};

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required.'],
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Application reference is required.'],
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required.'],
    },
    dayNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    checkIn: {
      time: { type: Date },
      geolocation: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number],
          default: undefined,
        },
        accuracy: Number,
      },
    },
    checkOut: {
      time: { type: Date },
      geolocation: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number],
          default: undefined,
        },
        accuracy: Number,
      },
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half_day'],
      default: 'present',
    },
    hoursWorked: {
      type: Number,
      default: 0,
    },
    note: {
      type: String,
      maxlength: 500,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index on the date and student — NOT a 2dsphere on the whole checkIn object
attendanceSchema.index({ student: 1, date: -1 });
attendanceSchema.index({ student: 1, application: 1 });

// Auto-calculate hours worked
attendanceSchema.pre('save', function (next) {
  if (this.checkIn?.time && this.checkOut?.time) {
    const diffMs = new Date(this.checkOut.time) - new Date(this.checkIn.time);
    this.hoursWorked = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    const checkInHour = new Date(this.checkIn.time).getHours();
    if (this.hoursWorked < 4) this.status = 'half_day';
    else if (checkInHour > 9) this.status = 'late';
    else this.status = 'present';
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
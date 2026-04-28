const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    // ---- OWNERSHIP ----
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

    // ---- LOG CONTENT ----
    dateOfActivity: {
      type: Date,
      required: [true, 'Date of activity is required.'],
      default: Date.now,
    },
    dayNumber: {
      type: Number,
      required: [true, 'Day number is required.'],
      min: [1, 'Day number must be at least 1.'],
    },
    title: {
      type: String,
      required: [true, 'Log title is required.'],
      trim: true,
      maxlength: [200, 'Log title cannot exceed 200 characters.'],
    },
    description: {
      type: String,
      required: [true, 'Log description is required.'],
      minlength: [50, 'Log description must be at least 50 characters long.'],
      maxlength: [5000, 'Log description cannot exceed 5000 characters.'],
    },
    skillsLearned: [
      {
        type: String,
        trim: true,
        maxlength: [100, 'Skill name cannot exceed 100 characters.'],
      },
    ],
    challenges: {
      type: String,
      trim: true,
      maxlength: [2000, 'Challenges field cannot exceed 2000 characters.'],
    },

    // ---- IMAGE CAPTURE (MANDATORY — device camera only, stored as Base64 JPEG) ----
    portraitImage: {
      data: {
        type: String,
        required: [
          true,
          'Portrait headshot is required. Image must be captured using your device camera.',
        ],
        // Stores: "data:image/jpeg;base64,/9j/4AAQSkZ..."
      },
      capturedAt: {
        type: Date,
        default: Date.now,
      },
    },
    environmentImage: {
      data: {
        type: String,
        required: [
          true,
          'Environment photo is required. Image must be captured using your device camera.',
        ],
      },
      capturedAt: {
        type: Date,
        default: Date.now,
      },
    },

    // ---- GEOLOCATION (FORCED — student cannot opt out) ----
    geolocation: {
      type: {
        type: String,
        enum: {
          values: ['Point'],
          message: 'Geolocation type must be Point.',
        },
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        // [longitude, latitude] — MongoDB GeoJSON order
        required: [
          true,
          'Geolocation coordinates are required. Location is automatically captured when you submit a log.',
        ],
        validate: {
          validator: function (coords) {
            return (
              Array.isArray(coords) &&
              coords.length === 2 &&
              coords[0] >= -180 &&
              coords[0] <= 180 &&
              coords[1] >= -90 &&
              coords[1] <= 90
            );
          },
          message:
            'Coordinates must be [longitude, latitude] with valid ranges: longitude -180 to 180, latitude -90 to 90.',
        },
      },
      accuracy: {
        type: Number,
        min: 0,
        // Accuracy in meters — lower is more precise
      },
      capturedAt: {
        type: Date,
        default: Date.now,
      },
    },

    // ---- APPROVAL WORKFLOW ----
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected', 'resubmitted'],
        message: '{VALUE} is not a valid log status.',
      },
      default: 'pending',
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    supervisorComment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Supervisor comment cannot exceed 1000 characters.'],
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [1000, 'Rejection reason cannot exceed 1000 characters.'],
    },
    resubmittedAt: {
      type: Date,
    },

    // ---- METADATA ----
    deviceInfo: {
      userAgent: {
        type: String,
        maxlength: [500, 'User agent string cannot exceed 500 characters.'],
      },
      platform: {
        type: String,
        maxlength: [100, 'Platform string cannot exceed 100 characters.'],
      },
    },
  },
  {
    timestamps: true,
  }
);

// ---- INDEXES ----
// Geospatial index — enables $near, $geoWithin, $geoIntersects queries
logSchema.index({ geolocation: '2dsphere' });

// Student log queries (paginated list, filtered by status or date)
logSchema.index({ student: 1, status: 1, dateOfActivity: -1 });

// Supervisor approval queue
logSchema.index({ supervisor: 1, status: 1 });

// Application-level queries (all logs for a given SIWES application)
logSchema.index({ application: 1, dateOfActivity: -1 });

// Coordinator overview (all logs by institution — joined through application)
logSchema.index({ student: 1, dateOfActivity: -1 });

// ---- VALIDATION: Day number must not be duplicated per application ----
// (Enforce at controller level — Mongoose does not support compound unique indexes with conditions)

module.exports = mongoose.model('Log', logSchema);
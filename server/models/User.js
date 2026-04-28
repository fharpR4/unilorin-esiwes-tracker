const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required.'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters.'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required.'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,
        'Please provide a valid email address.',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [6, 'Password must be at least 6 characters long.'],
      select: false, // Never returned in queries by default
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'supervisor', 'coordinator', 'admin'],
        message: '{VALUE} is not a valid role.',
      },
      required: [true, 'User role is required.'],
      default: 'student',
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters.'],
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      // Required for students and coordinators — validated in controller
    },
    courseOfStudy: {
      type: String,
      trim: true,
      maxlength: [150, 'Course of study cannot exceed 150 characters.'],
    },
    matricNumber: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [30, 'Matric number cannot exceed 30 characters.'],
    },
    department: {
      type: String,
      trim: true,
      maxlength: [150, 'Department name cannot exceed 150 characters.'],
    },
    level: {
      type: String,
      enum: {
        values: ['100', '200', '300', '400', '500', '600', ''],
        message: '{VALUE} is not a valid academic level.',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // ---- PASSWORD RESET FIELDS (select: false — never returned in queries) ----
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// ---- INDEXES ----
userSchema.index({ email: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ institution: 1, role: 1 });
userSchema.index({ matricNumber: 1, institution: 1 });

// ---- PRE-SAVE HOOK: Hash password before saving ----
userSchema.pre('save', async function (next) {
  // Only hash if password field was actually modified
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ---- INSTANCE METHOD: Compare entered password with stored hash ----
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ---- INSTANCE METHOD: Return safe user object (strips sensitive fields) ----
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

// ---- VIRTUAL: Full name ----
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
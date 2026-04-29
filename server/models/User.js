const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, 'First name is required.'], trim: true, maxlength: 50 },
    lastName: { type: String, required: [true, 'Last name is required.'], trim: true, maxlength: 50 },
    email: {
      type: String, required: [true, 'Email is required.'], unique: true,
      lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email.'],
    },
    password: { type: String, required: [true, 'Password is required.'], minlength: 6, select: false },
    role: {
      type: String,
      enum: { values: ['student', 'supervisor', 'coordinator', 'admin'], message: '{VALUE} is not a valid role.' },
      required: true,
      default: 'student',
    },
    phone: { type: String, trim: true, maxlength: 20 },

    // --- INSTITUTION (students, coordinators) ---
    institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },

    // --- STUDENT FIELDS ---
    courseOfStudy: { type: String, trim: true, maxlength: 150 },
    matricNumber: { type: String, trim: true, uppercase: true, maxlength: 30 },
    department: { type: String, trim: true, maxlength: 150 },
    level: {
      type: String,
      enum: { values: ['100', '200', '300', '400', '500', '600', ''], message: '{VALUE} is not valid.' },
    },

    // --- SUPERVISOR FIELDS ---
    // Supervisor can specify which institution/school they are from
    supervisorInstitution: { type: String, trim: true, maxlength: 200 },
    faculty: { type: String, trim: true, maxlength: 200 },
    supervisorDepartment: { type: String, trim: true, maxlength: 200 },
    staffId: { type: String, trim: true, maxlength: 50 },
    title: { type: String, trim: true, maxlength: 50 }, // Dr., Prof., Engr., Mr., Mrs.

    // --- SUPERVISOR: Students assigned to this supervisor ---
    // Students can be assigned here, or via the Application model (preferred)
    assignedStudents: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        assignedAt: { type: Date, default: Date.now },
      },
    ],

    isActive: { type: Boolean, default: true },

    // --- PASSWORD RESET ---
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ institution: 1, role: 1 });
userSchema.index({ matricNumber: 1, institution: 1 });
userSchema.index({ faculty: 1, supervisorDepartment: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
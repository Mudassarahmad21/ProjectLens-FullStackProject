// // server/models/User.js
// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Please provide a name'],
//     trim: true,
//     maxlength: [50, 'Name cannot be more than 50 characters']
//   },
//   email: {
//     type: String,
//     required: [true, 'Please provide an email'],
//     unique: true,
//     lowercase: true,
//     trim: true,
//     match: [
//       /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
//       'Please provide a valid email'
//     ]
//   },
//   password: {
//     type: String,
//     required: [true, 'Please provide a password'],
//     minlength: [6, 'Password must be at least 6 characters'],
//     select: false // Don't return password by default
//   },
//   role: {
//     type: String,
//     enum: ['user', 'admin', 'researcher'],
//     default: 'user'
//   },
//   institution: {
//     type: String,
//     trim: true,
//     default: null
//   },
//   researchInterest: {
//     type: String,
//     trim: true,
//     default: null
//   },
//   isEmailVerified: {
//     type: Boolean,
//     default: false
//   },
//   lastLogin: {
//     type: Date,
//     default: null
//   },
//   passwordChangedAt: {
//     type: Date,
//     default: Date.now
//   },
//   resetPasswordToken: {
//     type: String,
//     default: null
//   },
//   resetPasswordExpire: {
//     type: Date,
//     default: null
//   },
//   preferences: {
//     theme: {
//       type: String,
//       enum: ['light', 'dark', 'system'],
//       default: 'light'
//     },
//     defaultPatientView: {
//       type: String,
//       default: 'timeline'
//     }
//   }
// }, {
//   timestamps: true
// });

// // Hash password before saving
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
  
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   this.passwordChangedAt = new Date();
//   next();
// });

// // Compare password method
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// // Check if password was changed after JWT issued
// userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
//   if (this.passwordChangedAt) {
//     const changedTimestamp = parseInt(
//       this.passwordChangedAt.getTime() / 1000,
//       10
//     );
//     return JWTTimestamp < changedTimestamp;
//   }
//   return false;
// };

// const User = mongoose.model('User', userSchema);
// export default User;


// server/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'researcher'],
    default: 'user'
  },
  institution: {
    type: String,
    trim: true,
    default: null
  },
  researchInterest: {
    type: String,
    trim: true,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpire: {
    type: Date,
    default: null
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'light'
    },
    defaultPatientView: {
      type: String,
      default: 'timeline'
    }
  }
}, {
  timestamps: true
});


// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
  this.passwordChangedAt = new Date();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if password was changed after JWT issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

const User = mongoose.model('User', userSchema);

export default User;
// ✅ FIXED: Use function() with next parameter (not arrow function)
// userSchema.pre('save', function(next) {
//   // 'this' refers to the document being saved
//   const user = this;
  
//   // Only hash if password is modified
//   if (!user.isModified('password')) {
//     return next();
//   }

//   // Generate salt and hash password
//   bcrypt.genSalt(10, function(err, salt) {
//     if (err) {
//       return next(err);
//     }
    
//     bcrypt.hash(user.password, salt, function(err, hash) {
//       if (err) {
//         return next(err);
//       }
      
//       user.password = hash;
//       user.passwordChangedAt = new Date();
//       next();
//     });
//   });
// });

// // Compare password method - using async/await is fine here
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// // Check if password was changed after JWT issued
// userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
//   if (this.passwordChangedAt) {
//     const changedTimestamp = parseInt(
//       this.passwordChangedAt.getTime() / 1000,
//       10
//     );
//     return JWTTimestamp < changedTimestamp;
//   }
//   return false;
// };

// const User = mongoose.model('User', userSchema);
// export default User;
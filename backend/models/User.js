import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }, // Should be hashed in a real app
  phone: { type: String },
  location: { type: String }, // e.g., City
  work: { type: String }, // e.g., Profession
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say', ''], default: '' },
  age: { type: Number, min: 0, max: 120 },
  volunteering: { type: String, enum: ['yes', 'no', 'maybe', ''], default: '' },
  volunteeringTypes: { type: [String], default: [] }, // e.g., ['Environmental Cleanup', 'Community Support']
  volunteeringDays: { type: String, enum: ['Weekdays', 'Weekends', 'Flexible', ''], default: '' },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isActive: { type: Boolean, default: true }, // Added for soft deletion/deactivation
  profile_pic: { type: String, default: 'https://picsum.photos/200' }, // Placeholder profile picture
}, { timestamps: true });

// Generate sequential custom userId like USR001 or ADM001
userSchema.pre("save", async function (next) {
  if (this.isNew && !this.userId) { // Only generate for new documents
    try {
      const prefix = this.role === "admin" ? "ADM" : "USR";
      const lastUser = await mongoose.model("User").findOne(
        { role: this.role },
        {},
        { sort: { createdAt: -1 } }
      );

      let newNumber = 1;
      if (lastUser && lastUser.userId) {
        const lastNumber = parseInt(lastUser.userId.replace(prefix, ""), 10);
        if (!isNaN(lastNumber)) newNumber = lastNumber + 1;
      }

      this.userId = `${prefix}${String(newNumber).padStart(3, "0")}`;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

// Optional: remove password before sending user data
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model("User", userSchema);
export default User;

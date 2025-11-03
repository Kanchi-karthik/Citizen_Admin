import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: [String],
      required: true,
    },
    complaintType: {
      type: String,
      required: true,
    },
    areaType: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    days: {
      type: Number,
      required: true,
      min: 0
    },
    image: {
      type: String,
    },
    location: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },
    images: [{
      type: String,
      default: null,
    }],
    videos: [{
      type: String,
      default: null,
    }],
    comments: [{
      userName: String,
      text: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    chatMessages: [{
      userName: String,
      text: {
        type: String,
        required: true,
      },
      sender: {
        type: String,
        enum: ['admin', 'user'],
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    severity: {
      type: String,
      enum: ['Minor', 'Moderate', 'Major', 'Critical'],
      default: 'Moderate',
    },
    assignedDepartment: {
      type: String,
      enum: ['Public Works', 'Sanitation', 'Infrastructure', 'Healthcare', 'Education', 'Police', 'Fire', 'Water', 'Electricity', 'Parks', 'Transportation', 'Other'],
      default: null,
    },
    escalationLevel: {
      type: Number,
      enum: [1, 2, 3, 4],
      default: 1,
    },
    escalationReason: {
      type: String,
      default: '',
    },
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    satisfactionFeedback: {
      type: String,
      default: '',
    },
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    followUpNotes: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    resolution: {
      type: String,
      default: '',
    },
    contactNumber: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

complaintSchema.pre("save", async function (next) {
  if (this.isNew && !this.complaintId) {
    try {
      const lastComplaint = await mongoose.model("Complaint").findOne(
        {},
        {},
        { sort: { createdAt: -1 } }
      );

      let newNumber = 1;
      if (lastComplaint && lastComplaint.complaintId) {
        const lastNumber = parseInt(lastComplaint.complaintId.replace("CMP", ""), 10);
        if (!isNaN(lastNumber)) newNumber = lastNumber + 1;
      }

      this.complaintId = `CMP${String(newNumber).padStart(4, "0")}`;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

export default mongoose.model("Complaint", complaintSchema);

import mongoose from "mongoose";

const SubprojectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Title is require"],
  },
  title: {
    type: String,
    required: [true, "Title is require"],
  },
  description: String,
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Project"
  },
}, { 
  timestamps: true, 
});

SubprojectSchema.pre("remove", function(next) {
  // 'this' is the client being removed. Provide callbacks here if you want
  // to be notified of the calls' result.
  next();
});

export const Subproject= mongoose.model("Subproject", SubprojectSchema);

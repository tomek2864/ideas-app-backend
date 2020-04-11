import mongoose from "mongoose";

const SubprojectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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


export const Subproject= mongoose.model("Subproject", SubprojectSchema);

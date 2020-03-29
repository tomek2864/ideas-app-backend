import mongoose from "mongoose";

const SubprojectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Title is require"],
  },
  project: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: [true, "Title is require"],
  }],
  title: {
    type: String,
    required: [true, "Title is require"],
  },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
  description: String,
}, { timestamps: true });

export const Subproject= mongoose.model("Subproject", SubprojectSchema);

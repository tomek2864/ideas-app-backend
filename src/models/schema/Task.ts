import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Title is require"],
    },
    subproject: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subproject",
        required: [true, "Title is require"],
      },
    ],
    status: {
      type: String,
      enum: ["Backlog", "In progress", "Testing", "Done"],
      required: [true, "Status is require"],
    },
    title: {
      type: String,
      required: [true, "Title is require"],
    },
    description: String,
    estimationTime: Number,
  },
  { timestamps: true },
);

export const Task = mongoose.model("Task", TaskSchema);

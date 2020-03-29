import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Title is require"],
  },
  title: {
    type: String,
    required: [true, "Title is require"],
  },
  subtitle: String,
  description: String,
  subprojects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subproject" }],
}, { timestamps: true });

export const Project = mongoose.model("Project", ProjectSchema);

export type ProjectDocument = mongoose.Document & {
    userId: {
        type: mongoose.Schema.Types.ObjectId;
        ref: "User";
        required: [true, "Title is require"];
      };
      title: {
        type: string;
        required: [true, "Title is require"];
      };
      subtitle: string;
      description: string;
      subprojects: [{ type: mongoose.Schema.Types.ObjectId; ref: "Subproject" }];
};

import mongoose from "mongoose";
import { Subproject } from "./Subproject";

const mongoosePaginate = require("mongoose-paginate");

const ProjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Title is require"],
    },
    title: {
      type: String,
      required: [true, "Title is require"],
    },
    intentionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Intention",
    },
    subtitle: String,
    description: String,
  },
  {
    timestamps: true,
  },
);

ProjectSchema.virtual("issues", {
  ref: "Issue",
  localField: "_id",
  foreignField: "issuesId",
  justOne: false, // set true for one-to-one relationship
});

/* ProjectSchema.virtual("subprojects", {
  ref: "Subproject",
  localField: "_id",
  foreignField: "projectId",
  justOne: false, // set true for one-to-one relationship
}); */

ProjectSchema.set("toObject", { virtuals: true });
ProjectSchema.set("toJSON", { virtuals: true });

ProjectSchema.pre("remove", function (next) {
  // 'this' is the client being removed. Provide callbacks here if you want
  // to be notified of the calls' result.
  Subproject.remove({ projectId: this._id }).exec();
  next();
});

ProjectSchema.plugin(mongoosePaginate);

/* submissionSchema.pre('remove', function(next) {
  Client.update(
      { submission_ids : this._id}, 
      { $pull: { submission_ids: this._id } },
      { multi: true })  //if reference exists in multiple documents 
  .exec();
  next();
}); */

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
  createdAt: string;
  updateAt: string;
};

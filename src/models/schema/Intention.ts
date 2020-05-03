import mongoose from "mongoose";
import { Project } from "./Project";

const mongoosePaginate = require("mongoose-paginate");

const IntentionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Title is require"],
  },
  items: {
    type: Project,
    required: [true, "Title is require"],
  },
  description: String,
}, { 
  timestamps: true
});

IntentionSchema.virtual("projects", {
  ref: "Project",
  localField: "_id",
  foreignField: "intentionId",
  justOne: false // set true for one-to-one relationship
});

IntentionSchema.set("toObject", { virtuals: true });
IntentionSchema.set("toJSON", { virtuals: true });


IntentionSchema.pre("remove", function(next) {
  // 'this' is the client being removed. Provide callbacks here if you want
  // to be notified of the calls' result.
  Project.remove({ intentionId: this._id }).exec();
  next();
});

IntentionSchema.plugin(mongoosePaginate);



export const Intention = mongoose.model("Intention", IntentionSchema);

export type IntentionDocument = mongoose.Document & {
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
};


import mongoose from "mongoose";
import { IssueType, IssueStatus, IssuePriority } from "../../constants/issues";

const mongoosePaginate = require("mongoose-paginate");

const IssueSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Project ID is require"],
      ref: "Project",
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Title is require"],
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    key: {
      type: String,
      required: [true, "Key is require"],
    },
    title: {
      type: String,
      required: [true, "Title is require"],
    },
    summary: {
      type: String
    },
    type: {
      type: IssueType,
      default: IssueType.TASK,
      required: [true, "Type is require"],
    },
    status: {
      type: IssueStatus,
      default: IssueStatus.OPEN,
      required: [true, "Status is require"],
    },
    priority: {
      type: IssuePriority,
      default: IssuePriority.MEDIUM,
      required: [true, "Priority is require"],
    },
    estimationTime: {
        default: 0,
        type: Number
    },
    remainingTime: {
        default: 0,
        type: Number
    },
  },
  { timestamps: true },
);

IssueSchema.plugin(mongoosePaginate);

export type IssueDocument = mongoose.Document & {
    reporter: {
        type: mongoose.Schema.Types.ObjectId;
        ref: "User";
        required: [true, "Title is require"];
      };
      assignee: {
          type: mongoose.Schema.Types.ObjectId;
          ref: "User";
        };
      key: {
        type: string;
        required: [true, "Key is require"];
      };
      title: {
        type: string;
        required: [true, "Title is require"];
      };
      summary: {
        type: string;
      };
      type: {
        type: IssueType;
        default: IssueType.TASK;
        required: [true, "Type is require"];
      };
      status: {
        type: IssueStatus;
        default: IssueStatus.OPEN;
        required: [true, "Status is require"];
      };
      priority: {
        type: IssuePriority;
        default: IssuePriority.MEDIUM;
        required: [true, "Priority is require"];
      };
      estimationTime: {
          default: 0;
          type: number;
      };
      remainingTime: {
          default: 0;
          type: number;
      };
  };

  
export const Issue = mongoose.model<IssueDocument>("Issue", IssueSchema);
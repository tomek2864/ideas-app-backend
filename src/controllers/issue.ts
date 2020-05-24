import { Request, Response } from "express";
import { Issue, IssueDocument, Project } from "../models/schema";
import { check, validationResult, buildCheckFunction } from "express-validator";
import mongoose from "mongoose";
import { errorResponse } from "./helpers";
import { IssueType, IssueStatus, IssuePriority } from "../../src/constants/issues";
import { UserDocument } from "../models/schema/User";
const checkBodyAndQuery = buildCheckFunction(["body", "query"]);

export const createIssue = async (req: Request, res: Response) => {
  await check("title").isString().notEmpty().isLength({ max: 150 }).run(req);
  await check("description").isString().isLength({ max: 1500 }).run(req);
  await check("projectId").run(req);
  await check("assigneeId").run(req);
  await checkBodyAndQuery("type").optional().isString().isIn([
    IssueType.BUG, 
    IssueType.FEATURE, 
    IssueType.IMPROVEMENT, 
    IssueType.TASK
  ]).run(req);
  await checkBodyAndQuery("status").optional().isString().isIn([
    IssueStatus.CANCELED, 
    IssueStatus.DELETED, 
    IssueStatus.DONE, 
    IssueStatus.INPROGRESS,
    IssueStatus.OPEN,
    IssueStatus.REOPENED,
    IssueStatus.SELECTED,
  ]).run(req);
  await checkBodyAndQuery("priority").optional().isNumeric().isIn([
    IssuePriority.HIGH, 
    IssuePriority.HIGHEST, 
    IssuePriority.MEDIUM, 
    IssuePriority.LOW,
    IssuePriority.LOWEST,
  ]).run(req);
  await check("estimationTime").optional().isNumeric().run(req);
  await check("remainingTime").optional().isNumeric().run(req);

  try {
    const result = validationResult(req);
    const idValidation = mongoose.Types.ObjectId.isValid(req.body.projectId);
    let idAssigneeValidation = true;
    if(req.body.assigneeId){
      idAssigneeValidation = mongoose.Types.ObjectId.isValid(req.body.projectId);
    }
    if (!result.isEmpty()) {
      return res.status(400).json(errorResponse(result.array() as Array<any>));
    }
    if (!idValidation) {
      return res.status(400).json(errorResponse(["Invalid project id"]));
    }
    if (!idAssigneeValidation) {
      return res.status(422).json(errorResponse(["Invalid assignee id"]));
    }

    await Project.findOne({ _id: req.body.projectId, userId: req.user })
      .populate("issues")
      .exec(async (err, project: any) => {
        if (err) {
          return res.status(422).json({
            success: false,
          });
        }
        if (project === null) {
          return res.status(404).json({
            success: false,
          });
        }
        
        const issueKey = await project.generateIssueKeyName();
        const userToSend = req.user as UserDocument;
        const newIssue = await Issue.create({
          reporter: userToSend.id,
          assignee: userToSend.id,
          title: req.body.title,
          description: req.body.description,
          projectId: req.body.projectId,
          key: issueKey,
          type: req.body.type || IssueType.TASK,
          status: req.body.status || IssueStatus.OPEN,
          priority: req.body.priority || IssuePriority.MEDIUM,
          estimationTime: req.body.estimationTime || 0,
          remainingTime : req.body.remainingTime || 0,
        });
        newIssue
        .save()
        .then((issue: IssueDocument) => {
            const issueToSend = issue as IssueDocument;
            return res.status(200).json({
            success: true,
            data: {
              id: issueToSend._id,
              key: issueToSend.key,
              reporter: issueToSend.reporter,
              assignee: issueToSend.assignee,
              title: issueToSend.title,
              type: issueToSend.type,
              status: issueToSend.status,
              priority: issueToSend.priority,
              estimationTime: issueToSend.estimationTime,
              remainingTime: issueToSend.remainingTime,
            },
          });
        });
      });
  } catch (err) {
    return res.status(500);
  }
};
import { Request, Response } from "express";
import { Subproject, Project } from "../models/schema";
import { check, validationResult } from "express-validator";
import mongoose from "mongoose";

export const createSubproject = async (req: Request, res: Response) => {
  await check("title").isString().notEmpty().isLength({ max: 150 }).run(req);
  await check("description").isString().isLength({ max: 1500 }).run(req);
  await check("projectId").run(req);

  try {
    const result = validationResult(req);
    const idValidation = mongoose.Types.ObjectId.isValid(req.body.projectId);
    if (!result.isEmpty()) {
      return res.status(400).json({ success: false, errors: result.array() });
    }
    if (!idValidation) {
      return res.status(400).json({ success: false, errors: ["Invalid project id"] });
    }

    await Project.findById({ _id: req.body.projectId, userId: req.user }, async function (err) {
      if (err) {
        return res.status(400).json({ success: false });
      }
      const newSubroject = await Subproject.create({
        userId: req.user,
        title: req.body.title,
        description: req.body.description,
        projectId: req.body.projectId,
      });
      newSubroject
        .save()
        .then((subproject) =>
          res.status(200).json({
            success: true,
            data: {
              id: subproject._id,
            },
          }),
        )
        .catch(() => res.status(422).json({ success: false }));
    });
  } catch (err) {
    return res.status(500);
  }
};

// @route   PUT subproject/:id
// @desc    Update subproject by id
// @access  Private
export const updateSubproject = async (req: Request, res: Response) => {
  await check("title").isString().notEmpty().isLength({ max: 150 }).optional().run(req);
  await check("description").isString().optional().isLength({ max: 1500 }).run(req);

  const result = validationResult(req);
  const idValidation = mongoose.Types.ObjectId.isValid(req.params.id);
  if (!result.isEmpty()) {
    return res.status(400).json({ success: false, errors: result.array() });
  }
  if (!idValidation) {
    return res.status(400).json({ success: false, errors: "Invalid id" });
  }

  const updateData: any = {};
  const { title, description } = req.body;
  if (!!title) {
    updateData.title = title;
  }
  if (!!description) {
    updateData.description = description;
  }
  try {
    await Subproject.findOneAndUpdate(
      { _id: req.params.id, userId: req.user },
      { $set: updateData },
      { new: true, fields: "title description" },
    )
      .then((project) => {
        res.status(200).json({
          success: true,
          data: project,
        });
      })
      .catch(() => {
        res.status(422).json({
          success: false,
        });
      });
  } catch (err) {
    return res.status(500);
  }
};

export const deleteSubproject = async (req: Request, res: Response) => {
  try {
    const idValidation = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!idValidation) {
      return res.status(400).json({ success: false, errors: "Invalid id" });
    }
    await Subproject.findOne({ _id: req.params.id, userId: req.user })
      .then(async (doc) => {
        await doc
          .remove()
          .then(() => {
            return res.status(200).json({
              success: true,
            });
          })
          .catch(() => {
            return res.status(422).json({
              success: false,
            });
          });
      })
      .catch(() => {
        return res.status(404).json({
          success: false,
        });
      });
  } catch (err) {
    return res.status(500);
  }
};

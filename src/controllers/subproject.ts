import { Request, Response, NextFunction } from "express";
import { Subproject, Project } from "../models/schema";
import mongoose from "mongoose";
import {
    check,
    query,
    validationResult,
    buildCheckFunction,
  } from "express-validator";

export const createSubproject = async (req: Request, res: Response, next: NextFunction) => {
    await check("title")
    .isString()
    .notEmpty()
    .isLength({ max: 150 })
    .run(req);
  await check("description")
    .isString()
    .isLength({ max: 1500 })
    .run(req);

    try {
        const result = validationResult(req);
        if (!result.isEmpty()) {
          return res.status(422).json({ success: false, errors: result.array() });
        }
        await Project.findById({_id: req.body.id}, async function(err, project) {
            const newSubroject =  await Subproject.create({
                userId: req.user,
                title: req.body.title,
                description: req.body.description,
                projectId: req.body.id,
            });
            newSubroject
                .save()
                .then((subproject) =>
                    res.status(200).json({
                        success: true,
                        data: {
                            id: subproject._id
                        }
                    }),
                )
                .catch((err) => res.status(500).json({ error: err }));
        });
      } catch (err) {
        return res.status(400).json({ success: false });
      }
};


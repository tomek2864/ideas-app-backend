import { Request, Response } from "express";
import { check, validationResult, buildCheckFunction } from "express-validator";
import { Project, ProjectDocument, Intention, IntentionDocument } from "../models/schema";
import mongoose from "mongoose";
const checkBodyAndQuery = buildCheckFunction(["body", "query"]);

// @route   POST project/add
// @desc    Create new project
export const createProject = async (req: Request, res: Response) => {
  await check("title").isString().notEmpty().isLength({ max: 150 }).run(req);
  await check("subtitle").isString().isLength({ max: 250 }).run(req);
  await check("description").isString().isLength({ max: 1500 }).run(req);
  await check("intentionId").run(req);

  try {
    const result = validationResult(req);
    const idValidation = mongoose.Types.ObjectId.isValid(req.body.intentionId);
    if (!result.isEmpty()) {
      return res.status(400).json({ success: false, errors: result.array() });
    }
    if (!idValidation) {
      return res.status(400).json({ success: false, errors: ["Invalid intention id"] });
    }
    await Intention.findById({ _id: req.body.intentionId, userId: req.user }, async function (err, intention: IntentionDocument) {
      if (err) {
        return res.status(400).json({ success: false });
      }
      if (!intention) {
        return res.status(404).json({ success: false });
      }

      const newProject = await Project.create({
        userId: req.user,
        intentionId: req.body.intentionId,
        title: req.body.title,
        subtitle: req.body.subtitle,
        description: req.body.description,
        key:"ABC"
      });
      newProject
        .save()
        .then((project) =>
          res.status(200).json({
            success: true,
            data: {
              id: project._id,
            },
          }),
        )
        .catch(() => {
          return res.status(422).json({ success: false });
        });
    });
  } catch (err) {
    return res.status(500);
  }
};

// @route   GET /projects/:intentionId
// @desc    Get all projects of intetnion id
// @access  Private
/* array with object of Id, title, tag, creation data, update data */
/* /all?pageNumber=5&itemsPerPage=1&sorting=desc*/
export const getProjects = async (req: Request, res: Response) => {
  await checkBodyAndQuery("pageNumber").optional().isInt({ min: 1 }).run(req);
  await checkBodyAndQuery("itemsPerPage").optional().isInt({ min: 1, max: 100 }).run(req);
  await checkBodyAndQuery("sorting").optional().isString().isIn(["asc", "desc"]).run(req);

  try {
    const result = validationResult(req);
    const idValidation = mongoose.Types.ObjectId.isValid(req.params.intentionId);
    if (!result.isEmpty()) {
      return res.status(400).json({ success: false, errors: result.array() });
    }
    if (!idValidation) {
      return res.status(400).json({ success: false, errors: ["Invalid intentionId"] });
    }

    const options = {
      select: "title subtitle description createdAt",
      sort: { createdAt: req.query.sorting === "desc" ? -1 : 1 },
      page: parseInt(req.query.pageNumber || 1),
      limit: parseInt(req.query.itemsPerPage || 100),
    };

    await Project.paginate({ userId: req.user, intentionId: req.params.intentionId }, options, function (err, result) {
      if (err) {
        return res.status(422).json({
          success: false,
        });
      }
      return res.status(200).json({
        success: true,
        data: {
          docs: result.docs,
          total: result.total,
          limit: result.limit,
          page: result.page,
          pages: result.pages,
        },
      });
    });
  } catch (err) {
    return res.status(500);
  }
};

// @route   GET project/:id
// @desc    Get project by id
// @access  Private
export const getProject = async (req: Request, res: Response) => {
  try {
    const idValidation = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!idValidation) {
      return res.status(400).json({ success: false, errors: "Invalid id" });
    }

    await Project.findOne({ _id: req.params.id, userId: req.user })
      .populate("subprojects", "title subtitle description")
      .exec((err, project) => {
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
        const projectToSend = project as ProjectDocument;
        return res.status(200).json({
          success: true,
          data: {
            id: projectToSend.id,
            title: projectToSend.title,
            subtitle: projectToSend.subtitle,
            description: projectToSend.description,
            key: projectToSend.key,
            createdAt: projectToSend.createdAt,
            updatedAt: projectToSend.createdAt,
          },
        });
      });
  } catch (err) {
    return res.status(500);
  }
};

// @route   PUT project/:id
// @desc    Update project by id
// @access  Private
export const updateProject = async (req: Request, res: Response) => {
  await check("title").optional().isString().notEmpty().isLength({ max: 150 }).run(req);
  await check("subtitle").optional().isString().isLength({ max: 250 }).run(req);
  await check("description").optional().isString().isLength({ max: 1500 }).run(req);

  const result = validationResult(req);
  const idValidation = mongoose.Types.ObjectId.isValid(req.params.id);
  if (!result.isEmpty()) {
    return res.status(422).json({ success: false, errors: result.array() });
  }
  if (!idValidation) {
    return res.status(400).json({ success: false, errors: "Invalid id" });
  }

  const updateData: any = {};
  const { title, subtitle, description } = req.body;
  if (!!title) {
    updateData.title = title;
  }
  if (!!subtitle) {
    updateData.subtitle = subtitle;
  }
  if (!!description) {
    updateData.description = description;
  }
  try {
    await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user },
      { $set: updateData },
      { new: true, fields: "title subtitle description" },
    )
      .then((project) => {
        const projectToSend = project as ProjectDocument;
        return res.status(200).json({
          success: true,
          data: {
            id: projectToSend.id,
            title: projectToSend.title,
            subtitle: projectToSend.subtitle,
            description: projectToSend.description,
            createdAt: projectToSend.createdAt,
          },
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

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const idValidation = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!idValidation) {
      return res.status(400).json({ success: false, errors: "Invalid id" });
    }
    await Project.findOne({ _id: req.params.id, userId: req.user })
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

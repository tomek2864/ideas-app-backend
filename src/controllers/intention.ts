import { Request, Response } from "express";
import { check, validationResult, buildCheckFunction } from "express-validator";
import { Intention, IntentionDocument } from "../models/schema";
import mongoose from "mongoose";
const checkBodyAndQuery = buildCheckFunction(["body", "query"]);

// @route   POST /intention
// @desc    Create new intention

export const createIntention = async (req: Request, res: Response) => {
  await check("title").isString().notEmpty().isLength({ max: 150 }).run(req);
  await check("description").isString().isLength({ max: 1500 }).run(req);

  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ success: false, errors: result.array() });
    }
    const newIntention = await Intention.create({
      userId: req.user,
      title: req.body.title,
      description: req.body.description,
      updateDate: null,
    });
    newIntention
      .save()
      .then((intention) =>
        res.status(200).json({
          success: true,
          data: {
            id: intention._id,
          },
        }),
      )
      .catch(() => {
        return res.status(422).json({ success: false });
      });
  } catch (err) {
    return res.status(500);
  }
};

// @route   GET /intentions
// @desc    Get all intentions
// @access  Private
/* array with object of Id, title, tag, creation data, update data */
/* /all?pageNumber=5&itemsPerPage=1&sorting=desc*/
export const getIntentions = async (req: Request, res: Response) => {
  await checkBodyAndQuery("pageNumber").optional().isInt({ min: 1 }).run(req);
  await checkBodyAndQuery("itemsPerPage").optional().isInt({ min: 1, max: 100 }).run(req);
  await checkBodyAndQuery("sorting").optional().isString().isIn(["asc", "desc"]).run(req);

  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ success: false, errors: result.array() });
    }
    console.log(req.query);
    const options = {
      select: "title description createdAt",
      sort: { createdAt: req.query.sorting === "desc" ? -1 : 1 },
      page: parseInt(req.query.pageNumber || 1),
      limit: parseInt(req.query.itemsPerPage || 100),
    };
    await Intention.paginate({ userId: req.user }, options, function (err, result) {
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

// @route   GET /intention/:id
// @desc    Get intention by id
// @access  Private
export const getIntention = async (req: Request, res: Response) => {
  try {
    const idValidation = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!idValidation) {
      return res.status(400).json({ success: false, errors: ["Invalid id"] });
    }

    await Intention.findOne({ _id: req.params.id, userId: req.user })
      .populate("projects", "title description")
      .exec((err, intention) => {
        if (err) {
          return res.status(422).json({
            success: false,
          });
        }
        if (intention === null) {
          return res.status(404).json({
            success: false,
          });
        }
        const intentionToSend = intention as IntentionDocument;
        return res.status(200).json({
          success: true,
          data: {
            id: intentionToSend.id,
            title: intentionToSend.title,
            description: intentionToSend.description,
            projects: intentionToSend.projects,
            createdAt: intentionToSend.createdAt,
          },
        });
      });
  } catch (err) {
    return res.status(500);
  }
};

// @route   PUT /intention/:id
// @desc    Update intention by id
// @access  Private
export const updateIntention = async (req: Request, res: Response) => {
  await check("title").optional().isString().notEmpty().isLength({ max: 150 }).run(req);
  await check("description").optional().isString().isLength({ max: 1500 }).run(req);

  const result = validationResult(req);
  const idValidation = mongoose.Types.ObjectId.isValid(req.params.id);
  if (!result.isEmpty()) {
    return res.status(422).json({ success: false, errors: result.array() });
  }
  if (!idValidation) {
    return res.status(400).json({ success: false, errors: ["Invalid id"] });
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
    await Intention.findOneAndUpdate(
      { _id: req.params.id, userId: req.user },
      { $set: updateData },
      { new: true, fields: "title description createdAt" },
    )

      .then((intention) => {
        const intentionToSend = intention as IntentionDocument;
        return res.status(200).json({
          success: true,
          data: {
            id: intentionToSend.id,
            title: intentionToSend.title,
            description: intentionToSend.description,
            createdAt: intentionToSend.createdAt,
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

// @route   PUT /intention/:id
// @desc    Delete intention by id
// @access  Private
export const deleteIntention = async (req: Request, res: Response) => {
  try {
    const idValidation = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!idValidation) {
      return res.status(400).json({ success: false, errors: ["Invalid id"] });
    }
    await Intention.findOne({ _id: req.params.id, userId: req.user })
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

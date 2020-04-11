import { Request, Response, NextFunction } from "express";
import {
    check,
    query,
    validationResult,
    buildCheckFunction,
  } from "express-validator";
  import { Project, ProjectDocument } from "../models/schema";
  import mongoose from "mongoose";
  const checkBodyAndQuery = buildCheckFunction(["body", "query",]);
  const checkParams = buildCheckFunction(["params"]);


  const countCollectionItems = (collection: mongoose.Model<mongoose.Document, {}>) => {
    return new Promise((resolve, reject) => {
      try {
        collection.countDocuments({}, (err, count) => {
          if (err) {
            reject(Error("Counter of collection broke"));
          }
          resolve(count);
        });
      } catch {
        reject(Error("Cannot count the collection"));
      }
    });
  };
  
  const getCollectionWithPagination = (
    collection: mongoose.Model<mongoose.Document, {}>,
    pageNumber: number = 0,
    nPerPage: any,
    sort: string = "desc"
  ) => {
    return new Promise((resolve, reject) => {
      try {
        countCollectionItems(collection).then((elementsAmount: number) => {
          try {
            collection
              .find()
              /* .populate("subprojects") */
              .sort({ createdAt: sort === "desc" ? -1 : 1 })
              .skip(pageNumber > 0 ? ((pageNumber - 1) * nPerPage) : 0)
              .limit(parseInt(nPerPage, 10) || nPerPage)
              .then((item)=> {
                resolve({
                  content: item,
                  info: {
                    totalElements: elementsAmount,
                    totalPages:
                      nPerPage > 0 ? Math.ceil(elementsAmount / nPerPage) : 1,
                  },
                });
              });
          } catch {
            reject(Error("Pagination of collection broke"));
          }
        });
      } catch {
        return Error("Get elements of collection broke");
      }
    });
  };

// @route   POST project/add
// @desc    Create new project

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
    await check("title")
    .isString()
    .notEmpty()
    .isLength({ max: 150 })
    .run(req);
  await check("subtitle")
    .isString()
    .isLength({ max: 250 })
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
        const newProject = await Project.create({
            userId: req.user,
            title: req.body.title,
            subtitle: req.body.subtitle,
            description: req.body.description,
            updateDate: null,
        });
        newProject
            .save()
            .then((project) =>
                res.status(200).json({
                    success: true,
                    data: {
                        id: project
                    }
                }),
            );
      } catch (err) {
        return res.status(400).json({ success: false });
      }
};

// @route   GET project/all
// @desc    Get all projects
// @access  Private
/* array with object of Id, title, tag, creation data, update data */
/* /all?pageNumber=5&itemsPerPage=1&sorting=desc*/
export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
    await checkBodyAndQuery("pageNumber")
    .optional()
    .isInt({ min: 0 })
    .run(req);
  await checkBodyAndQuery("itemsPerPage")
    .optional()
    .isInt({ min: 1, max: 100 })
    .run(req);
  await checkBodyAndQuery("sorting")
    .optional()
    .isString()
    .isIn(["asc", "desc"])
    .run(req);

  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(422).json({ success: false, errors: result.array() });
    }
    getCollectionWithPagination(
      Project,
      req.query.pageNumber,
      req.query.itemsPerPage,
      req.query.sorting,
    )
      .then(projects => {
        return res.status(200).json({
          success: true,
          data: projects,
        });
      })
      .catch(() => {
        return res.status(422).json({
          success: false,
        });
      });
  } catch {
    return res.status(400).json({
      success: false,
    });
  }
};

// @route   GET project/:id
// @desc    Get project by id
// @access  Private
export const getProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idValidation = mongoose.Types.ObjectId.isValid(req.params.id);
        if (!idValidation) {
            return res.status(422)
            .json({ success: false, errors: "Invalid id"});
            }

            await Project.findOne({_id: req.params.id})
            .populate("subprojects", "title" )
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
              return res.status(200).json({
                success: true,
                data: project,
              });
            });

        /* await Project.findById(req.params.id, (err, project) => {
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
          return res.status(200).json({
            success: true,
            data: project,
          });
        }); */


      } catch {
        return res.status(400).json({
          success: false,
        });
      }
};


// @route   PUT project/:id
// @desc    Update project by id
// @access  Private
export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
    await check("title")
      .isString()
      .notEmpty()
      .isLength({ max: 150 })
      .run(req);
    await check("subtitle")
      .isString()
      .isLength({ max: 250 })
      .run(req);
    await check("description")
      .isString()
      .isLength({ max: 1500 })
      .run(req);
    
      const result = validationResult(req);
      const idValidation = mongoose.Types.ObjectId.isValid(req.params.id);
      if (!result.isEmpty()) {
        return res.status(422).json({ success: false, errors: result.array() });
      }
      if (!idValidation) {
          return res.status(422)
          .json({ success: false, errors: "Invalid id"});
          }
      await Project.findById(req.params.id)
      .then((p: any) => {
          p.title = req.body.title;
          p.subtitle = req.body.subtitle;
          p.description = req.body.description;
          return p.save();
      })
      .then((result) => {
          res.status(200).json({
              success: true,
              data: result,
            });
      })
      .catch((err) => {
          res.status(400).json({
            success: false,
          });
      });
};

// @route   DELETE project/:id
// @desc    Delete project by id
// @access  Private
/* export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idValidation = mongoose.Types.ObjectId.isValid(req.params.id);
        if (!idValidation) {
            return res.status(422)
            .json({ success: false, errors: "Invalid id"});
            }
        await Project.findOneAndDelete({ _id: req.params.id }, (err, project) => {
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
          return res.status(200).json({
            success: true,
          });
        });
      } catch {
        return res.status(400).json({
          success: false,
        });
      }
}; */
export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idValidation = mongoose.Types.ObjectId.isValid(req.params.id);
        if (!idValidation) {
            return res.status(422)
            .json({ success: false, errors: "Invalid id"});
            }
            //await Project.findOne({  _id: req.params.id }).remove().exec()
            const doc = await Project.findOne({  _id: req.params.id });
            await doc.remove()
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
      } catch {
        return res.status(400).json({
          success: false,
        });
      }
};
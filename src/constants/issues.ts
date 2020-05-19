export enum IssueType {
    TASK = "task", // A task that needs to be done.
    FEATURE = "feature", // A new feature of the product.
    IMPROVEMENT  = "improvement", // An enhancement to an existing feature.
    BUG = "bug", // A problem which impairs or prevents the functions of the product.
  }
  
  export enum IssueStatus {
    DELETED = "deleted",
    OPEN = "open",
    REOPENED = "reopened",
    SELECTED = "selected",
    INPROGRESS = "inprogress",
    DONE = "done",
    CANCELED = "CANCELED",
  }
  
  export enum IssuePriority {
    HIGHEST = "5",
    HIGH = "4",
    MEDIUM = "3",
    LOW = "2",
    LOWEST = "1",
  }
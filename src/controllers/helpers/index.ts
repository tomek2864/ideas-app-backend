export const errorFormatter = ({ msg, param }: any) => {
  return {
    msg: `${msg}`,
    param: `${param}`,
  };
};


export const errorResponse = (errors: Array<string>) => {
  return {
    success: false,
    errors
  };
};

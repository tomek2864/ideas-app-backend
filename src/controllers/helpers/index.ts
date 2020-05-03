export const errorFormatter = ( { msg, param}: any ) => {
    return {
        msg: `${msg}`,
        param: `${param}`,
    };
};
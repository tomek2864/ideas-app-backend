import mongoose from "mongoose";
export const connectDb = async (dbUrl: string) => {
    mongoose.connect(
        dbUrl, 
        { 
            useNewUrlParser: true, 
            useCreateIndex: true, 
            useUnifiedTopology: true 
        } )
        .then(
            () => { 
                const ENVIRONMENT = process.env["NODE_ENV"];
                const test = ENVIRONMENT === "test";
                if(test){
                    mongoose.connection.db.dropDatabase();
                }
            /** ready to use. 
             * The `mongoose.connect()` promise resolves to undefined. */ },
        )
        .catch(err => {
            console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
        // process.exit();  
    });
};
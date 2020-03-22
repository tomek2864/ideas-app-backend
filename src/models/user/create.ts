import { User } from "../schema";

interface UserCredentionals {
    email: string;
    password: string;
}

async function createUser({email, password}: UserCredentionals) {
    return new Promise(async (resolve, reject) => {
      const user = await User.findOne({ email }, (err) => {
          if(err) return reject(err);
      });
      if(user) reject("Email is already in use");
  
      resolve(
        await User.create({
          email,
          password,
        }),
      );
    });
  }
  
  export { createUser };
import { User } from "../schema";
import { UserType } from "../schema/User";

interface UserCredentionals {
    email: string;
    password: string;
    premium: UserType;
}

async function createUser({email, password, premium}: UserCredentionals) {
    return new Promise(async (resolve, reject) => {
      const user = await User.findOne({ email }, (err) => {
          if(err) return reject(err);
      });
      if(user) reject("Email is already in use");
  
      resolve(
        await User.create({
          email,
          password,
          premium,
        }),
      );
    });
  }
  
  export { createUser };
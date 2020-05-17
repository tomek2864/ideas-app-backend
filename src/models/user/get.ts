import { User } from "../schema";

async function getUserById(id: string) {
  return await User.findById(id).exec();
}

async function getUserByEmail(email: string) {
  return await User.findOne({ email }).exec();
}

export { getUserById, getUserByEmail };

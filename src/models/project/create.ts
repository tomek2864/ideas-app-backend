import { Project, Intention, IntentionDocument } from "../schema";
import { UserDocument } from "../schema/User";

interface ProjectData {
    key: string;
    title: string;
    subtitle: string;
    description: string;
    user: UserDocument;
    intentionId: string;
}

async function createProject({ 
    key, 
    description,
    title, 
    subtitle,
    user,
    intentionId,
}: ProjectData) {
  return new Promise(async (resolve, reject) => {
    const intention = await Intention.findOne({ _id: intentionId, userId: user }, (err)  => {
      if (err) return reject(err);
    });

    const project = await Project.findOne({ key }, (err, pr: any) => {
      if (err) return reject(err);
    });
    if (!intention) reject("IntentionId is not exist");
    if (project) reject("Key is already in exist");

    resolve(
      await Project.create({
        key, 
        description,
        title, 
        subtitle,
        userId: user,
        intentionId,
      }),
    );
  });
}

export { createProject };
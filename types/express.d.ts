// import { IUserDocument } from "../schema/users/user.model";

import { IUserDocument } from "../src/schema/users/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}

export {};
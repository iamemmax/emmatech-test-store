import { Request, Response } from "express"
import AsyncHandler from "express-async-handler"
import jwt from "jsonwebtoken"
import { UserProps } from "../../types/users/user.types"
import userModel from "../../schema/users/user.model"
import { issueTokens, clearAuthCookies } from "../../utils/token"
import { env } from "../../utils/require-env"

interface RefreshPayload {
    userId: string;
}

export const listAlluser = (AsyncHandler(async (req: Request<{}, {}, UserProps>, res: Response) => {

    try {
        const users = await userModel.find().select("-__v -password -token")
        res.status(201).json({
            res: "ok",
            total: users?.length,
            users
        })
    } catch (error: any) {
        res.status(401)
        throw new Error(error.message);
    }

}))
export const getAuthenticatedUser = (AsyncHandler(async (req: Request<{ userId: string }, {}, UserProps>, res: Response) => {

    try {
        const users = await userModel.findById({ _id: req.params.userId }).select("-__v -password -token")
        res.status(201).json({
            res: "ok",
            users
        })
    } catch (error: any) {
        res.status(401)
        throw new Error(error.message);
    }

}))
export const registerNewUser = AsyncHandler(
    async (req: Request, res: Response) => {
        const { first_name, last_name, username, email, password } = req.body;

        const userWithEmailExist = await userModel.findOne({ email });

        if (userWithEmailExist) {
            res.status(401);
            throw new Error(`User with ${email} already exists`);
        }

        const user = await userModel.create({
            first_name,
            last_name,
            email,
            username,
            password,

        });

        const token = await issueTokens(res, user);

        if (user) {
            res.status(201).json({
                _id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                token,
            });
        } else {
            res.status(401);
            throw new Error("Invalid user data");
        }
    }
);

export const loginUser = AsyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // select("+password") — needed because the schema hides it
    const user = await userModel.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
        res.status(401);
        throw new Error("Invalid email or password");
    }

    const token = await issueTokens(res, user);

    res.json({
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        roles: user.roles,
        token,
    });
});
export const refreshToken = AsyncHandler(async (req: Request, res: Response) => {
    const incoming = req.cookies?.refreshToken;

    if (!incoming) {
        res.status(401);
        throw new Error("Not authorised, no refresh token");
    }

    let decoded: RefreshPayload;

    try {
        decoded = jwt.verify(incoming, env.jwtRefreshSecret) as RefreshPayload;
    } catch {
        res.status(401);
        throw new Error("Not authorised, refresh token invalid or expired");
    }

    const user = await userModel.findById(decoded.userId).select("+token +tokenExpiresAt");

    const stillValid =
        user &&
        user.matchRefreshToken(incoming) &&
        user.tokenExpiresAt &&
        user.tokenExpiresAt.getTime() > Date.now();

    if (!stillValid) {
        // Either forged/stale, or a previously-rotated token being replayed —
        // revoke whatever's stored so a stolen token can't be retried.
        if (user) {
            user.clearRefreshToken();
            await user.save();
        }
        res.status(401);
        throw new Error("Not authorised, refresh token invalid or expired");
    }

    const token = await issueTokens(res, user); // rotates: this refresh token is now dead too

    res.json({ message: "Token refreshed", token });
});
export const updateUser = AsyncHandler(async (req: Request<{ userId: string }>, res: Response) => {
    try {
        const user = await userModel.findById({ _id: req.params.userId })
        if (user) {
            const updateUserData = await userModel.findOneAndUpdate({ _id: req.params.userId }, {
                first_name: req.body.first_name || user.first_name,
                last_name: req.body.last_name || user.last_name,
                username: req.body.username || user.username,
                phone_number: req.body.phone_number || user.phone_number,
            }, { new: true }).select("-__v -password -token")
            if (updateUserData) {
                res.status(201).json({
                    message: "user updated successfully",
                    users: updateUserData
                })
            }
        }
    } catch (error) {
        res.status(401);
        throw new Error("Invalid user data");

    }
});


export const logoutUser = AsyncHandler(async (req: Request, res: Response) => {
    const incoming = req.cookies?.refreshToken;

    if (incoming) {
        try {
            const decoded = jwt.verify(incoming, env.jwtRefreshSecret) as RefreshPayload;
            const user = await userModel.findById(decoded.userId).select("+token +tokenExpiresAt");
            if (user) {
                user.clearRefreshToken();
                await user.save();
            }
        } catch (error) {
        res.status(401);
        throw new Error("Invalid user data");

    }
    }

    clearAuthCookies(res);
    res.json({ message: "Logged out" });
});

// delete user by admin and super admin

export const deleteUser = AsyncHandler(async (req: Request<{userId: string}>, res: Response) => {
   const {userId} = req.params
   if(!userId){
       res.status(401)
       throw new Error("user id not found")
   }
   const userExist = await userModel.findById(userId)
   if(!userExist){
       res.status(401)
       throw new Error("user does not exist")
   }
    try {
    const user = await userModel.findOneAndDelete({_id: userId})
   

    
    if(user){
        res.status(201).json({
            message: "user deleted successfully",
            user
        })
    }
} catch (error) {
        res.status(401);
        throw new Error("Invalid user data");

    }
   
});
import { Request, Response } from "express";
import BallbyBall from "../models/ballbyball.model";

export const fetchBallbyBall = async (req: Request, res: Response) => {
    try {
        const ballbyball = await BallbyBall.find({}).select("commentary").limit(20).lean().exec();

        res.json(ballbyball);
    } catch (error) {
        console.log(error);

        const { message } = error as Error;
        res.status(500).json({ message: "Error updating stats", error: message });
    }
};

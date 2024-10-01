import mongoose, { Schema, Document } from "mongoose";
import { BallType, NoBallScenarios, WideScenarios } from "../interface";
import { IStatsPayload } from "../controllers/updateStats.controller";

export interface IBallByBall extends Document {
    matchId: mongoose.Types.ObjectId;
    ballId: string;
    over: string;
    ball: number;
    strikerBatsmanId: mongoose.Types.ObjectId;
    strikerBatsmanStats: {
        runs: number;
        balls: number;
    };
    nonStrikerBatsmanId: mongoose.Types.ObjectId;
    nonStrikerBatsmanStats: {
        runs: number;
        balls: number;
    };
    outBatsmanId: mongoose.Types.ObjectId;
    bowlerId: mongoose.Types.ObjectId;
    runs: number;
    extras: string; // e.g., "NO Ball", "Wide"
    ballType: string;
    commentary: string;
    payload: IStatsPayload;
    isStrikerChanged: boolean;
}

const BallByBallSchema = new Schema(
    {
        matchId: { type: Schema.Types.ObjectId, ref: "Match", required: true },
        ballId: {
            type: String,
        },
        over: { type: String, required: true },
        ball: { type: Number, required: true },
        strikerBatsmanId: { type: Schema.Types.ObjectId, ref: "Player", required: true },
        strikerBatsmanStats: {
            runs: Number,
            balls: Number,
        },
        nonStrikerBatsmanId: { type: Schema.Types.ObjectId, ref: "Player", required: true },
        nonStrikerBatsmanStats: {
            runs: Number,
            balls: Number,
        },
        outBatsmanId: { type: Schema.Types.ObjectId, ref: "Player" },
        bowlerId: { type: Schema.Types.ObjectId, ref: "Player", required: true },
        runs: { type: Number, required: true },
        extras: { type: String, default: "" },
        ballType: {
            type: String,
            default: "",
            enum: {
                ...Object.values(BallType),
                ...Object.values(NoBallScenarios),
                ...Object.values(WideScenarios),
            },
        },
        payload: {},
        commentary: { type: String, required: true },
        isWicket: Boolean,
        isStrikerChanged: Boolean,
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IBallByBall>("BallByBall", BallByBallSchema);

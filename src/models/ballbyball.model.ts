import mongoose, { Schema, Document } from "mongoose";
import { BallType, NoBallScenarios, WideScenarios } from "../interface";

interface IBallByBall extends Document {
    matchId: mongoose.Types.ObjectId;
    ballId: String;
    over: number;
    ball: number;
    strikerBatsmanId: mongoose.Types.ObjectId;
    nonStrikerBatsmanId: mongoose.Types.ObjectId;
    outBatsmanId: mongoose.Types.ObjectId;
    bowlerId: mongoose.Types.ObjectId;
    runs: number;
    extras: string; // e.g., "NO Ball", "Wide"
    ballType: string;
    commentary: string;
}

const BallByBallSchema = new Schema(
    {
        matchId: { type: Schema.Types.ObjectId, ref: "Match", required: true },
        ballId: {
            type: String,
        },
        over: { type: Number, required: true },
        ball: { type: Number, required: true },
        strikerBatsmanId: { type: Schema.Types.ObjectId, ref: "Player", required: true },
        nonStrikerBatsmanId: { type: Schema.Types.ObjectId, ref: "Player", required: true },
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
        commentary: { type: String, required: true },
        isWicket: Boolean,
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IBallByBall>("BallByBall", BallByBallSchema);

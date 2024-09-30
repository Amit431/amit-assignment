import mongoose, { Schema, Document } from "mongoose";

interface IBallByBall extends Document {
    matchId: mongoose.Types.ObjectId;
    over: number;
    ball: number;
    batsmanId: mongoose.Types.ObjectId;
    bowlerId: mongoose.Types.ObjectId;
    runs: number;
    extras: string; // e.g., "NO Ball", "Wide"
    commentary: string;
}

const BallByBallSchema = new Schema({
    matchId: { type: Schema.Types.ObjectId, ref: "Match", required: true },
    over: { type: Number, required: true },
    ball: { type: Number, required: true },
    batsmanId: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    bowlerId: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    runs: { type: Number, required: true },
    extras: { type: String, default: "" },
    commentary: { type: String, required: true },
});

export default mongoose.model<IBallByBall>("BallByBall", BallByBallSchema);

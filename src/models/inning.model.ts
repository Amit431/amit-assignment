import mongoose, { Document, Schema } from "mongoose";
import { IPlayer } from "./player.model";

// Define the interface for the Inning
export interface IInning {
    teamName: string; // Name of the team
    teamId: string; // ID of the team
    runs: number; // Runs scored by the team
    wickets?: number; // Wickets lost (optional)
    overs?: string; // Overs played (optional)
    inningsType: "first" | "second"; // To differentiate between first or second innings
    matchId: string; // Reference to the match
    balls: Number;
    wides: Number;
    noballs: Number;
    legbyes: Number;
    byes: Number;
    overthrows: Number;
    playingXI: Array<typeof Schema.Types.ObjectId | string> | IPlayer[];
    bowlers: Array<typeof Schema.Types.ObjectId | string> | IPlayer[];
}

interface IInningDoc extends IInning, Document {}

// Define the Inning schema
const InningSchema: Schema = new Schema(
    {
        teamName: {
            type: String,
            required: true,
        },
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        runs: {
            type: Number,
            required: true,
            default: 0,
        },
        balls: {
            type: Number,
            default: 0,
        },
        wickets: {
            type: Number,
            default: 0,
        },
        overs: {
            type: String,
            default: "0.0",
        },
        inningsType: {
            type: String,
            enum: ["first", "second"],
            required: true,
        },
        matchId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        wides: {
            type: Number,
            default: 0,
        },
        noballs: {
            type: Number,
            default: 0,
        },
        legbyes: {
            type: Number,
            default: 0,
        },
        byes: {
            type: Number,
            default: 0,
        },
        overthrows: {
            type: Number,
            default: 0,
        },
        playingXI: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                },
            ],
            ref: 'Player'
        },
        bowlers: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                },
            ],
            ref: 'Player'
        },
    },
    { timestamps: true }
);

InningSchema.index({
    matchId: 1,
});

// Create the Inning model
const Inning = mongoose.model<IInningDoc>("Inning", InningSchema);

export default Inning;

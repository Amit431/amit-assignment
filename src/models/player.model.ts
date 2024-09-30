import mongoose, { Schema, Document } from "mongoose";

// Extend the IPlayer interface with additional fields
export interface IPlayer {
    name: string;
    team: string;
    runs: number;
    wickets: number;
    ballsFaced: number;
    oversBowled: number;
    bowlerEconomy: number;
    battingAverage?: number; // Batting average
    bowlingAverage?: number; // Bowling average
    strikeRate?: number; // Strike rate for batsmen
    bestPerformance?: string; // Best performance description (e.g., "100 runs" or "5 wickets")
    wides: number;
    noballs: number;
    legbyes: number;
    byes: number;
    overthrows: number;
    isStriker: boolean;
    isNonStriker: boolean;
    isBowler: boolean;
}

export interface IPlayerDoc extends IPlayer, Document {}

const PlayerSchema = new Schema({
    name: { type: String, required: true },
    team: { type: String, required: true },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    ballsFaced: { type: Number, default: 0 },
    oversBowled: { type: Number, default: 0 },
    bowlerEconomy: { type: Number, default: 0 },
    battingAverage: { type: Number, default: 0 }, // Batting average field
    bowlingAverage: { type: Number, default: 0 }, // Bowling average field
    strikeRate: { type: Number, default: 0 }, // Strike rate field
    bestPerformance: { type: String, default: "" }, // Best performance description field
    wides: { type: Number, default: 0 },
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
    isStriker: Boolean,
    isNonStriker: Boolean,
    isBowler: Boolean,
});

// Export the Player model
export default mongoose.model<IPlayerDoc>("Player", PlayerSchema);

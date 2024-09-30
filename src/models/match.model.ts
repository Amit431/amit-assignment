import mongoose, { Schema, Document, mongo } from "mongoose";

interface IMatch extends Document {
    teamA: string;
    teamB: string;
    tossWinner: string;
    overs: string;
    battingTeam: string;
    bowlingTeam: string;
    battingTeamScore: number;
    bowlingTeamScore: number;
}

const MatchSchema = new Schema({
    teamA: { type: mongoose.Schema.Types.ObjectId, required: true },
    teamB: { type: mongoose.Schema.Types.ObjectId, required: true },
    tossWinner: { type: String, required: true },
    overs: { type: String, required: true },
});

export default mongoose.model<IMatch>("Match", MatchSchema);

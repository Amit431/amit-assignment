import mongoose, { Schema, Document } from "mongoose";

interface IMatch extends Document {
    teamA: string;
    teamB: string;
    tossWinner: string;
    overs: number;
    battingTeam: string;
    bowlingTeam: string;
    battingTeamScore: number;
    bowlingTeamScore: number;
    players: Array<{ playerId: mongoose.Types.ObjectId; team: string }>;
}

const MatchSchema = new Schema({
    teamA: { type: String, required: true },
    teamB: { type: String, required: true },
    tossWinner: { type: String, required: true },
    overs: { type: Number, required: true },
    players: [{ playerId: { type: Schema.Types.ObjectId, ref: "Player" }, team: String }],
});

export default mongoose.model<IMatch>("Match", MatchSchema);

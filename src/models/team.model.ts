import mongoose, { Schema, Document } from "mongoose";

interface ITeam extends Document {
    name: string;
}

const PlayerSchema = new Schema({
    name: { type: String, required: true },
});

export default mongoose.model<ITeam>("Team", PlayerSchema);

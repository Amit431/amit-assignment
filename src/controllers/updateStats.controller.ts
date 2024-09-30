import { Request, Response } from "express";
import { updateStats } from "../services/stats.service";

export interface IStatsPayload {
    normal: number;
    noball: boolean;
    legbye: boolean;
    byes: boolean;
    overthrow: number; // How many runs comes on overthrow if no runs than -1
    wide: boolean;
}

export interface IStatsReqPayload {
    matchId: string;
    batsmanId: string;
    bowlerId: string;
    payload: IStatsPayload;
}

export const handleUpdateStats = async (req: Request, res: Response) => {
    try {
        const { matchId, batsmanId, bowlerId, payload } = req.body as IStatsReqPayload;

        // Call the service function to update the stats
        const result = await updateStats({
            matchId,
            batsmanId,
            bowlerId,
            payload,
        });

        res.status(200).json({ message: "Stats updated successfully", data: result });
    } catch (error) {
        const { message } = error as Error;
        res.status(500).json({ message: "Error updating stats", error: message });
    }
};

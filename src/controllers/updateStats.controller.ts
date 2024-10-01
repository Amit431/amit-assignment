import "../models/team.model";
import { Request, Response } from "express";
import { updateStats } from "../services/stats.service";
import Inning, { IInning } from "../models/inning.model";
import Player, { IPlayer } from "../models/player.model";
import _ from "lodash";
import BallByBall, { IBallByBall } from "../models/ballbyball.model";

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
    strikerId: string;
    nonStrikerId: string;
    bowlerId: string;
    payload: IStatsPayload;
}

export const handleUpdateStats = async (req: Request, res: Response) => {
    try {
        const { matchId } = req.params;
        const { strikerId, nonStrikerId, bowlerId, payload } = req.body as IStatsReqPayload;

        // Call the service function to update the stats
        const result = await updateStats({
            matchId,
            strikerId,
            nonStrikerId,
            bowlerId,
            payload,
        });

        res.status(200).json({ message: "Stats updated successfully", data: result });
    } catch (error) {
        console.log(error);

        const { message } = error as Error;
        res.status(500).json({ message: "Error updating stats", error: message });
    }
};

export interface IScoreCard {
    teamA: object;
    teamB: object;
    strikerBatsman: Partial<IPlayer>;
    nonStrikerBatsman: Partial<IPlayer>;
    bowler: Partial<IPlayer>;
    ballbyball: Partial<IBallByBall[]>;
}

export const fetchScoreBoard = async (req: Request, res: Response) => {
    try {
        const { matchId } = req.params;

        const innings = await Inning.find({
            matchId,
        })
            .populate("playingXI bowlers")
            .lean<IInning[]>();

        // Initialize an empty scorecard object
        const scorecard: IScoreCard = {
            teamA: {},
            teamB: {},
            strikerBatsman: {},
            nonStrikerBatsman: {},
            bowler: {},
            ballbyball: [],
        };

        // Reduce over the innings array and populate the scorecard
        innings.forEach((inning) => {
            if (inning.inningsType === "first") {
                scorecard.teamA = inning;
            } else if (inning.inningsType === "second") {
                scorecard.teamB = inning;
            }

            if (inning.playingXI?.length > 0) {
                scorecard.strikerBatsman = (inning.playingXI.find((player) => (player as IPlayer).isStriker) ||
                    {}) as Partial<IPlayer>;
                scorecard.nonStrikerBatsman = (inning.playingXI.find((player) => !(player as IPlayer).isStriker) ||
                    {}) as Partial<IPlayer>;
            }

            if (inning.bowlers?.length > 0) {
                const bowler = (inning.bowlers?.find((player) => (player as IPlayer).isBowler) as IPlayer) || {};

                scorecard.bowler = ({
                    ...bowler,
                    overs: `${bowler.ballsFaced < 6 ? 0 : Math.trunc((bowler.ballsFaced || 0) / 6)}.${
                        (bowler.ballsFaced || 0) % 6
                    }`,
                } || {}) as Partial<IPlayer>;
            }
        });

        const ballbyball = await BallByBall.find({}).select("commentary over").sort({_id: -1}).limit(20).lean().exec();

        scorecard.ballbyball = ballbyball;

        res.json(scorecard);
    } catch (error) {
        console.log("====================================");
        console.log(error);
        console.log("====================================");
        const { message } = error as Error;
        res.status(500).json({ message: "Error updating stats", error: message });
    }
};

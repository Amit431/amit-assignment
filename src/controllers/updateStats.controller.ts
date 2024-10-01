import "../models/team.model";
import { Request, Response } from "express";
import { updateStats } from "../services/stats.service";
import Inning, { IInning } from "../models/inning.model";
import Player, { IPlayer } from "../models/player.model";
import _ from "lodash";
import BallByBall, { IBallByBall } from "../models/ballbyball.model";
import { findBallTypeScenario } from "../utils/findBallTypeScenario.util";
import Strategy, { IStatsOutputPayload } from "../services/strategy.service";
import addOvers, { addOversV2 } from "../utils/addOvers.util";
import { BallType } from "../interface";
import matchModel from "../models/match.model";
import playerModel from "../models/player.model";

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

        const ballbyball = await BallByBall.find({})
            .select("commentary over")
            .sort({ _id: -1 })
            .limit(20)
            .lean()
            .exec();

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

export const EditStats = async (req: Request, res: Response) => {
    try {
        const { matchId, ballId } = req.params;
        const { payload } = req.body as IStatsReqPayload;

        // Fetch the current inning
        const currentInning = await Inning.findOne({ matchId: matchId, status: "In Progress" });
        if (!currentInning) throw new Error("No inning found.");

        // Fetch the existing ball data from BallByBall
        const previousBall = await BallByBall.findById(ballId);
        // console.log(previousBall);

        if (!previousBall) throw new Error("Ball not found.");

        // Reset::: Run the reverse strategy to undo the previous ball impact
        const previousBallType = previousBall.ballType;
        const previousPayload: IStatsPayload = previousBall.payload;
        const isPreviousStrikerChanged = previousBall.isStrikerChanged;

        const previousUpdation = Strategy[previousBallType](previousPayload);
        const reverseTeamStats = previousUpdation.team || {};

        // Subtract previous stats from the current inning's score, overs, etc.
        const updatedInningScore = (currentInning.runs || 0) - (reverseTeamStats.runs || 0);
        const updatedOvers = addOvers(currentInning.overs || "0.0", `${reverseTeamStats.overs || "0.0"}`, true);

        // New Changes:: Apply the new ball data strategy
        const newBallType = findBallTypeScenario(payload);
        const newStats = Strategy[newBallType](payload);
        const newTeamStats = newStats.team || {};

        // Update the inning with Score & Over
        const finalInningScore = updatedInningScore + (newTeamStats.runs || 0); // new Score
        const finalOvers = addOversV2(updatedOvers, newTeamStats.overs || "0.0");

        // Query to find balls after the edited ball
        const balls = await BallByBall.find({
            ball: {
                $gte: previousBall.ball,
            },

            matchId: matchId,
        }).sort({ ball: 1 });

        let overProgress: 1 | -1 | 0 = 0;
        // for add 1 and for substract -1 and 0 for as it is

        const isBatsmanStrikeSwap =
            ((newTeamStats.runs || 0) % 2 === 0 && previousBall.runs % 2 !== 0) ||
            ((newTeamStats.runs || 0) % 2 !== 0 && previousBall.runs % 2 === 0);

        const battingStats: {
            striker: {
                runs?: number;
                ballsFaced?: number;
                totalRuns?: number;
                totalBallsFaced?: number;
            };
            nonstriker: {
                runs?: number;
                ballsFaced?: number;
                totalRuns?: number;
                totalBallsFaced?: number;
            };
        } = {
            striker: {},
            nonstriker: {},
        };

        const completedOver = Number(previousBall.over.split(".")[0]);

        balls.forEach(async (ball, index) => {
            const overBall = Number(previousBall.over.split(".")[0]);
            if (overBall !== completedOver) return;

            const ballId = ball._id;
            let ballByBallUpdatedOver = null;
            let strikerBatsmanId = null;
            let nonStrikerBatsmanId = null;

            // Update Over
            if (previousBallType !== newBallType && index === 0) {
                if (
                    [BallType.BYE, BallType.LEG_BYE, BallType.NORMAL, BallType.OVERTHROW].includes(
                        previousBallType as (typeof BallType)[keyof typeof BallType]
                    ) &&
                    ![BallType.BYE, BallType.LEG_BYE, BallType.NORMAL, BallType.OVERTHROW].includes(
                        newBallType as (typeof BallType)[keyof typeof BallType]
                    )
                ) {
                    ballByBallUpdatedOver = addOversV2(previousBall.over || "0.0", "0.1", true);
                    overProgress = 1;
                } else if (
                    [BallType.BYE, BallType.LEG_BYE, BallType.NORMAL, BallType.OVERTHROW].includes(
                        newBallType as (typeof BallType)[keyof typeof BallType]
                    ) &&
                    ![BallType.BYE, BallType.LEG_BYE, BallType.NORMAL, BallType.OVERTHROW].includes(
                        previousBallType as (typeof BallType)[keyof typeof BallType]
                    )
                ) {
                    ballByBallUpdatedOver = addOversV2(previousBall.over || "0.0", "0.1", false);
                    overProgress = -1;
                } else {
                    overProgress = 0;
                }
            } else if (overProgress === 1) {
                ballByBallUpdatedOver = addOversV2(ball.over || "0.0", "0.1", true);
            } else if (overProgress === -1) {
                ballByBallUpdatedOver = addOversV2(ball.over || "0.0", "0.1", false);
            }

            const prevBall = index !== 0 ? balls[index - 1] : null;

            // Update Striker
            if (isBatsmanStrikeSwap && index !== 0 && prevBall) {
                const striker = ball.strikerBatsmanId;
                strikerBatsmanId = ball.nonStrikerBatsmanId;
                nonStrikerBatsmanId = striker;

                if (prevBall.runs % 2 === 0) {
                    battingStats.striker = {
                        runs: (battingStats.striker?.runs || 0) + ball.strikerBatsmanStats.runs,
                        ballsFaced: (battingStats.striker?.ballsFaced || 0) + ball.strikerBatsmanStats.balls,
                    };
                } else {
                    battingStats.nonstriker = {
                        runs: (battingStats.nonstriker?.runs || 0) + ball.strikerBatsmanStats.runs,
                        ballsFaced: (battingStats.nonstriker?.ballsFaced || 0) + ball.strikerBatsmanStats.balls,
                    };
                }
            }

            const mapString: { [key: string]: string } = {
                normal: "runs",
            };

            // Update the ball in BallByBall collection
            const updatedBall = {
                ...(index === 0
                    ? {
                          ballType: newBallType,
                          runs: payload.normal,
                          payload,
                      }
                    : {}),
                ...(ballByBallUpdatedOver ? { over: ballByBallUpdatedOver } : {}),
                ...(strikerBatsmanId ? { strikerBatsmanId } : {}),
                ...(nonStrikerBatsmanId ? { nonStrikerBatsmanId } : {}),
                ...(index === 0
                    ? {
                          strikerBatsmanStats: {
                              runs: newStats.batsman?.runs || 0,
                              balls: newStats.batsman?.ballsFaced || 0,
                          },
                      }
                    : {}),

                ...(index === 0
                    ? {
                          commentary: `${newStats.team.runs} ${newBallType !== BallType.NORMAL ? "runs" : ""} (${
                              mapString[newBallType as string] || newBallType
                          } ${newBallType === BallType.OVERTHROW ? payload.overthrow : ""}) scored`,
                      }
                    : {}),
            };

            // console.log(updatedBall, finalInningScore, finalOvers);

            await BallByBall.findByIdAndUpdate(ballId, updatedBall);
        });

        console.log({ battingStats });

        const isBallUp = Number(finalOvers) > Number(currentInning.overs);
        const isBallDown = Number(finalOvers) < Number(currentInning.overs);

        if (!isBatsmanStrikeSwap || balls.length === 1) {
            await Player.updateOne(
                {
                    _id: previousBall.strikerBatsmanId,
                },
                {
                    $inc: {
                        runs: (newStats.batsman?.runs || 0) - (previousUpdation.batsman?.runs || 0),
                        ballsFaced: isBallUp ? 1 : isBallDown && !(payload.noball || payload.wide) ? -1 : 0,
                    },
                }
            );
        } else {
            await Player.updateOne(
                {
                    _id: previousBall.strikerBatsmanId,
                },
                {
                    $inc: {
                        runs:
                            (battingStats.nonstriker.runs || 0) -
                            (battingStats.striker.runs || 0) +
                            ((newStats.batsman?.runs || 0) - (previousUpdation.batsman?.runs || 0)),
                        ballsFaced: (battingStats.nonstriker?.ballsFaced || 0) - (battingStats.striker.ballsFaced || 0),
                    },
                    $set: {
                        isStriker: true,
                    },
                }
            );

            const updateRuns = (battingStats.striker.runs || 0) - (battingStats.nonstriker.runs || 0);
            const updateBalls = (battingStats.striker?.ballsFaced || 0) - (battingStats.nonstriker.ballsFaced || 0);

            await Player.updateOne(
                {
                    _id: previousBall.nonStrikerBatsmanId,
                },
                {
                    $inc: {
                        runs: updateRuns,
                        ballsFaced: updateBalls,
                    },
                    $set: {
                        isStriker: false,
                    },
                }
            );
        }
        await Player.updateOne(
            {
                _id: previousBall.bowlerId,
            },
            {
                $inc: {
                    runs: (newStats.bowler?.runs || 0) - (previousUpdation.bowler?.runs || 0),
                    ballsFaced: isBallUp ? 1 : isBallDown ? -1 : 0,
                },
            }
        );

        // // Update the inning document with recalculated stats
        await Inning.updateOne(
            { matchId: matchId },
            {
                $set: {
                    runs: finalInningScore,
                    overs: finalOvers,
                },
                $inc: {
                    balls: newTeamStats.balls || 0, // Update the balls faced
                },
            }
        );

        res.json({ message: "Ball edited successfully", ballId });
    } catch (error) {
        console.log(error);
        const { message } = error as Error;
        res.status(500).json({ message: "Error updating stats", error: message });
    }
};

export const ToggleStrike = async (req: Request, res: Response) => {
    const players = await Player.find({ isStriker: { $exists: true } }).lean();

    const ballbyball = await BallByBall.findOne().sort({ _id: -1 });

    let strikerId: string | null = null;
    let nonStrikerId: string | null = null;

    players.map(async (player) => {
        if (nonStrikerId === null) nonStrikerId = player.isStriker ? player._id.toString() : null;
        if (strikerId === null) strikerId = !player.isStriker ? player._id.toString() : null;

        await Player.updateOne(
            { _id: player._id },
            {
                isStriker: !player.isStriker,
            }
        );
    });

    ballbyball?._id &&
        (await BallByBall.updateOne(
            { _id: ballbyball?._id },
            {
                strikerBatsmanId: strikerId,
                nonStrikerBatsmanId: nonStrikerId,
            }
        ));

    res.json({});
};

export async function ResetScoreBoard(req: Request, res: Response) {
    try {
        const { matchId } = req.params;

        await Inning.updateOne(
            {
                matchId,
            },
            {
                $set: {
                    runs: 0,
                    overs: "0.0",
                    balls: 0,
                    wides: 0,
                    noballs: 0,
                    legbyes: 0,
                    byes: 0,
                    overthrows: 0,
                    deliveries: 0,
                },
            }
        );

        await playerModel.updateMany(
            {},
            {
                runs: 0,
                ballsFaced: 0,
                wides: 0,
                legbyes: 0,
                byes: 0,
            }
        );

        await BallByBall.deleteMany({});

        res.json({ msg: "ok" });
    } catch (error) {
        const { message } = error as Error;
        res.status(500).json({ error: message });
    }
}

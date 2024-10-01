import { IStatsPayload } from "../controllers/updateStats.controller";
import { BallType, NoBallScenarios, WideScenarios } from "../interface";
import { IInning } from "../models/inning.model";
import { IPlayer } from "../models/player.model";

export interface IStatsOutputPayload {
    team: Partial<IInning>;
    batsman?: Partial<IPlayer>;
    bowler?: Partial<IPlayer>;
}

const WIDE_RUNS = 1;
const NO_BALL_RUNS = 1;

function calculateNoBall(payload: IStatsPayload): IStatsOutputPayload {
    const stats: IStatsOutputPayload = {
        team: {
            runs: NO_BALL_RUNS + payload.normal,
            overs: "0.0",
            balls: 0,
            noballs: 1,
        },
        batsman: {
            runs: !(payload.legbye || payload.byes) ? payload.normal : 0, // No runs for leg byes and byes for batsman
            ballsFaced: 1,
            noballs: 1,
            legbyes: payload.legbye ? payload.normal : 0,
        },
        bowler: {
            runs: !(payload.legbye || payload.byes) ? NO_BALL_RUNS + payload.normal : NO_BALL_RUNS, // No runs for leg byes and byes for bowler
            ballsFaced: 0, // No-balls do not count as balls faced for the bowler
            noballs: 1,
        },
    };

    return stats;
}

const Strategy = {
    [BallType.NORMAL]: function (payload: IStatsPayload): IStatsOutputPayload {
        const stats: IStatsOutputPayload = {
            team: {
                runs: payload.normal,
                overs: "0.1",
                balls: 1,
            },
            batsman: {
                runs: payload.normal,
                ballsFaced: 1,
            },
            bowler: {
                runs: payload.normal,
                ballsFaced: 1,
            },
        };

        return stats;
    },

    [BallType.WIDE]: function (payload: IStatsPayload): IStatsOutputPayload {
        const stats: IStatsOutputPayload = {
            team: {
                runs: WIDE_RUNS + payload.normal, // Add 1 for wide runs
                overs: "0.0",
                balls: 0,
                wides: 1, // Count wide in extras
            },
            batsman: {
                byes: payload.normal,
            }, // No runs added to batsman for a wide
            bowler: {
                runs: WIDE_RUNS + payload.normal, // Count runs for wide
                ballsFaced: 0, // Counts as a delivery faced
                wides: 1,
            },
        };

        return stats;
    },
    [BallType.OVERTHROW]: function (payload: IStatsPayload): IStatsOutputPayload {
        const stats: IStatsOutputPayload = {
            team: {
                runs: payload.overthrow + payload.normal, // Add 1 for wide runs
                overs: "0.1",
                balls: 1,
                overthrows: payload.overthrow,
            },
            batsman: {
                runs: payload.normal + payload.overthrow,
                ballsFaced: 1,
            }, // No runs added to batsman for a wide
            bowler: {
                runs: payload.overthrow + payload.normal, // Count runs for wide
                ballsFaced: 1, // Counts as a delivery faced
            },
        };

        return stats;
    },

    [BallType.NO_BALL]: calculateNoBall,
    [NoBallScenarios.LEGBYE]: calculateNoBall,
    [NoBallScenarios.BYE]: calculateNoBall,

    [BallType.LEG_BYE]: function (payload: IStatsPayload): IStatsOutputPayload {
        const stats: IStatsOutputPayload = {
            team: {
                runs: payload.normal, // Add normal runs
                overs: "0.1",
                balls: 1,
                legbyes: 1, // Count leg byes in extras
            },
            batsman: {
                runs: 0, // Batsman does not score on leg byes
                ballsFaced: 1, // Counts as a ball faced
                legbyes: payload.normal,
            },
            bowler: {
                runs: 0, // No runs added to bowler for leg bye
                ballsFaced: 1, // Counts as a delivery faced
                legbyes: 1, // Count leg byes in extras for the bowler
            },
        };

        return stats;
    },

    [BallType.BYE]: function (payload: IStatsPayload): IStatsOutputPayload {
        const stats: IStatsOutputPayload = {
            team: {
                runs: payload.normal, // Add normal runs
                overs: "0.1",
                balls: 1,
                byes: payload.normal, // Count byes in extras
            },
            batsman: {
                runs: 0, // Batsman does not score on byes
                ballsFaced: 1, // Counts as a ball faced
                byes: payload.normal,
            },
            bowler: {
                runs: 0, // No runs added to bowler for bye
                ballsFaced: 1, // Counts as a delivery faced
                byes: payload.normal, // Count byes in extras for the bowler
            },
        };

        return stats;
    },

    [WideScenarios.OVERTHROW]: function (payload: IStatsPayload): IStatsOutputPayload {
        const stats: IStatsOutputPayload = {
            team: {
                runs: WIDE_RUNS + payload.overthrow + payload.normal, // Add wide runs and overthrow runs
                overs: "0.0",
                balls: 0,
                wides: 1,
                overthrows: payload.overthrow, // Count overthrow in extras
            },
            batsman: {},
            bowler: {
                runs: WIDE_RUNS + payload.overthrow + +payload.normal, // Count the wide and overthrow runs
                ballsFaced: 0, // Counts as a delivery faced
                wides: 1,
                overthrows: payload.overthrow, // Count overthrow in extras for the bowler
            },
        };

        return stats;
    },
} as {
    [key: string]: (payload: IStatsPayload) => IStatsOutputPayload;
};

export default Strategy;

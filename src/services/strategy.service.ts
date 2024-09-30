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
            overs: "0.1",
            balls: 1,
            noballs: 1,
        },
        batsman: {
            runs: payload.normal + (payload.legbye ? 0 : 0) + (payload.byes ? 0 : 0), // No runs for leg byes and byes for batsman
            ballsFaced: 1,
            noballs: 1,
        },
        bowler: {
            runs: payload.normal + (payload.legbye ? 0 : 0) + (payload.byes ? 0 : 0), // No runs for leg byes and byes for bowler
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
                runs: WIDE_RUNS, // Add 1 for wide runs
                overs: "0.1",
                balls: 1,
                wides: 1, // Count wide in extras
            },
            batsman: {}, // No runs added to batsman for a wide
            bowler: {
                runs: WIDE_RUNS, // Count runs for wide
                ballsFaced: 1, // Counts as a delivery faced
                wides: 1,
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
            },
            bowler: {
                runs: 0, // No runs added to bowler for bye
                ballsFaced: 1, // Counts as a delivery faced
                byes: 1, // Count byes in extras for the bowler
            },
        };

        return stats;
    },

    [WideScenarios.OVERTHROW]: function (payload: IStatsPayload): IStatsOutputPayload {
        const stats: IStatsOutputPayload = {
            team: {
                runs: WIDE_RUNS + payload.overthrow, // Add wide runs and overthrow runs
                overs: "0.1",
                balls: 1,
                wides: 1,
                overthrows: payload.overthrow, // Count overthrow in extras
            },
            batsman: {},
            bowler: {
                runs: WIDE_RUNS + payload.overthrow, // Count the wide and overthrow runs
                ballsFaced: 1, // Counts as a delivery faced
                wides: 1,
                overthrows: payload.overthrow, // Count overthrow in extras for the bowler
            },
        };

        return stats;
    },
} as {
    [key: string]: (payload: IStatsPayload) => IStatsOutputPayload;
};

// Function to handle leg bye with no ball scenario
const handleLegByeWithNoBall = function (payload: IStatsPayload): IStatsOutputPayload {
    const stats: IStatsOutputPayload = {
        team: {
            runs: NO_BALL_RUNS + payload.normal,
            overs: "0.1",
            balls: 1,
            legbyes: payload.normal, // Count leg byes in extras
            noballs: 1,
        },
        batsman: {
            runs: payload.legbye ? 0 : payload.normal, // Batsman gets no runs for leg byes
            ballsFaced: 1,
            noballs: 1,
        },
        bowler: {
            runs: payload.legbye ? 0 : payload.normal, // Bowler gets no runs for leg byes
            ballsFaced: 0, // No-balls do not count as balls faced for the bowler
            noballs: 1,
        },
    };

    return stats;
};

// Adding more scenarios if necessary
Strategy[NoBallScenarios.LEGBYE] = handleLegByeWithNoBall;
Strategy[NoBallScenarios.BYE] = calculateNoBall; // Use the same logic as the no ball

export default Strategy;

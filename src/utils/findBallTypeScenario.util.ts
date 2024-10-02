import { IStatsPayload } from "../controllers/updateStats.controller";
import { BallType, NoBallScenarios, WideScenarios } from "../interface";

export const findBallTypeScenario = (statsPayload: IStatsPayload): string => {
    const { normal, noball, legbye, byes, overthrow, wide } = statsPayload;

    // Check for Wide scenario
    if (wide) {
        if(normal > 0)
            return WideScenarios.RUNS;
        if (overthrow > 0) {
            return WideScenarios.OVERTHROW; // Wide leading to an overthrow
        }
        return WideScenarios.NORMAL; // Just Wide
    }

    // Check for No Ball scenario
    if (noball) {
        if (legbye) {
            return NoBallScenarios.LEGBYE; // No Ball + Leg Bye
        }
        if (byes) {
            return NoBallScenarios.BYE; // No Ball + Bye Runs
        }
        return BallType.NO_BALL;
    }

    // Check for Leg Bye
    if (legbye) {
        return BallType.LEG_BYE; // Just Leg Bye
    }

    // Check for Bye
    if (byes) {
        return BallType.BYE; // Just Bye
    }

    // Check for Overthrow scenario (if it's a run scored on an overthrow)
    if (overthrow > 0) {
        return BallType.OVERTHROW; // Overthrow scenario
    }

    // If no conditions are met, it is a normal delivery
    return BallType.NORMAL; // Normal Runs
};

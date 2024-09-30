import { IStatsPayload } from "../controllers/updateStats.controller";
import { BallType, NoBallScenarios, WideScenarios } from "../interface";

export const findBallTypeScenario = (statsPayload: IStatsPayload): string => {
    const { normal, noball, legbye, byes, overthrow, wide } = statsPayload;

    // Check for No Ball scenario
    if (noball) {
        if (legbye) {
            return NoBallScenarios.LEGBYE; // No Ball + Leg Bye
        }
        if (byes) {
            return NoBallScenarios.BYE; // No Ball + Bye Runs
        }
        return NoBallScenarios.NORMAL; // Just No Ball
    }

    // Check for Wide scenario
    if (wide) {
        if (overthrow > 0) {
            return WideScenarios.OVERTHROW; // Wide leading to an overthrow
        }
        return WideScenarios.NORMAL; // Just Wide
    }

    // Check for Overthrow scenario (if it's a run scored on an overthrow)
    if (overthrow > 0) {
        return BallType.OVERTHROW; // Overthrow scenario
    }

    // Check for Leg Bye
    if (legbye) {
        return BallType.LEG_BYE; // Just Leg Bye
    }

    // Check for Bye
    if (byes) {
        return BallType.BYE; // Just Bye
    }

    // If no conditions are met, it is a normal delivery
    return BallType.NORMAL; // Normal Runs
};

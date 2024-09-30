import Match from "../models/match.model";
import Player, { IPlayer, IPlayerDoc } from "../models/player.model";
import BallByBall from "../models/ballbyball.model";
import { calculateBattingStats, calculateBowlingStats } from "../utils/calculateStats.util";
import { findBallTypeScenario } from "../utils/findBallTypeScenario.util";
import { partition } from "lodash";
import { IStatsPayload, IStatsReqPayload } from "../controllers/updateStats.controller";
import Strategy, { IStatsOutputPayload } from "./strategy.service";
import { Types } from "mongoose";
import Inning from "../models/inning.model";
import addOvers from "../utils/addOvers.util";

export const updateStats = async (input: IStatsReqPayload) => {
    const { matchId, batsmanId, bowlerId, payload } = input;

    // Find match and both players (batsman and bowler) concurrently
    const [match, players] = await Promise.all([
        Match.findById(matchId),
        Player.find({ _id: { $in: [batsmanId, bowlerId] } }), // Fetch both batsman and bowler
    ]);

    if (!match || players.length < 2) {
        throw new Error("Match or Players not found");
    }

    const [batsmanArray, bowlerArray] = partition(
        players,
        (player: IPlayerDoc) => (player._id as Types.ObjectId).toString() === batsmanId
    );

    const batsman = batsmanArray[0];
    const bowler = bowlerArray[0];

    if (!batsman || !bowler) {
        throw new Error("Batsman or Bowler not found");
    }

    const ballType = findBallTypeScenario(payload);

    const strategy: (payload: IStatsPayload) => IStatsOutputPayload = Strategy[ballType];

    const updation = strategy(payload);

    // Update innings document
    const currentInning = await Inning.findOne({ matchId: matchId });

    if (!currentInning) throw new Error("No inning found.");

    // Prepare new overs
    const newOvers: string = currentInning.overs || "0.0"; // Default to '0.0' if no inning found
    const updatedOvers = addOvers(newOvers, updation.team?.overs || "0.0");

    await Inning.updateOne(
        { matchId: matchId },
        {
            $inc: {
                runs: updation.team?.runs || 0,
                balls: updation.team?.balls || 0,
            },
            $set: {
                overs: updatedOvers,
            },
        }
    );

    // Update batsman stats
    await Player.updateOne(
        { _id: batsmanId },
        {
            $inc: {
                runs: updation.batsman?.runs || 0,
                ballsFaced: updation.batsman?.ballsFaced || 0,
                wides: updation.batsman?.wides || 0,
                legbyes: updation.batsman?.legbyes || 0,
                byes: updation.batsman?.byes || 0,
            },
        }
    );

    // Update bowler stats
    await Player.updateOne(
        { _id: bowlerId },
        {
            $inc: {
                runs: updation.bowler?.runs || 0,
                ballsFaced: updation.bowler?.ballsFaced || 0,
                noballs: updation.bowler?.noballs || 0,
                wides: updation.bowler?.wides || 0,
                byes: updation.bowler?.byes || 0,
                legbyes: updation.bowler?.legbyes || 0,
            },
        }
    );

    return { batsman, bowler, match };
};

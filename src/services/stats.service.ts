import Match from "../models/match.model";
import Player, { IPlayer, IPlayerDoc } from "../models/player.model";
import { calculateBattingStats, calculateBowlingStats } from "../utils/calculateStats.util";
import { findBallTypeScenario } from "../utils/findBallTypeScenario.util";
import { partition } from "lodash";
import { IStatsPayload, IStatsReqPayload } from "../controllers/updateStats.controller";
import Strategy, { IStatsOutputPayload } from "./strategy.service";
import { Types } from "mongoose";
import Inning from "../models/inning.model";
import addOvers, { addOversV2 } from "../utils/addOvers.util";
import { BallType } from "../interface";
import BallByBall from "../models/ballbyball.model";

export const updateStats = async (input: IStatsReqPayload) => {
    const { matchId, strikerId, nonStrikerId, bowlerId, payload } = input;

    // Find match and both players (batsman and bowler) concurrently
    const [match, players] = await Promise.all([
        Match.findById(matchId),
        Player.find({ _id: { $in: [strikerId, bowlerId, nonStrikerId] } }), // Fetch both batsman and bowler
    ]);

    if (!match || players.length < 2) {
        throw new Error("Match or Players not found");
    }

    // Partition players into batsman, bowler, and non-striker
    const [batsmanArray, othersArray] = partition(
        players,
        (player: IPlayerDoc) => (player._id as Types.ObjectId).toString() === strikerId
    );
    const batsman = batsmanArray[0];
    const [bowlerArray, nonStrikerArray] = partition(
        othersArray,
        (player: IPlayerDoc) => (player._id as Types.ObjectId).toString() === bowlerId
    );
    const bowler = bowlerArray[0];
    const nonStrikerBats = nonStrikerArray[0];

    if (!batsman || !bowler) {
        throw new Error("Batsman or Bowler not found");
    }

    const ballType = findBallTypeScenario(payload);

    const strategy: (payload: IStatsPayload) => IStatsOutputPayload = Strategy[ballType];

    const updation = strategy(payload);

    // Update innings document
    const currentInning = await Inning.findOne({ matchId: matchId, status: "In Progress" });

    if (!currentInning) throw new Error("No inning found.");

    // Prepare new overs
    const newOvers: string = currentInning.overs || "0.0"; // Default to '0.0' if no inning found
    const updatedOvers = addOvers(newOvers, updation.team?.overs || "0.0");
    const isOverComplete = updatedOvers.endsWith(".0") && !updatedOvers.startsWith("0.");
    const legalRuns = (updation.team?.runs || 0) - (payload.wide || payload.noball ? 1 : 0);

    await Inning.updateOne(
        { matchId: matchId },
        {
            $inc: {
                runs: updation.team?.runs || 0,
                balls: updation.team?.balls || 0,
                legbyes: payload.legbye ? legalRuns - (payload.overthrow > -1 ? payload.overthrow : 0) : 0,
                wides: payload.wide ? updation.team.wides : 0,
                noballs: payload.noball ? 1 : 0,
                byes: payload.byes ? legalRuns - (payload.overthrow > -1 ? payload.overthrow : 0) : 0,
                overthrows: payload.overthrow !== -1 ? payload.overthrow : 0,
                deliveries: 1,
            },
            $set: {
                overs: updatedOvers,
            },
        }
    );

    let isStriker = (legalRuns || 0) % 2 === 0 ? true : false;
    isStriker = isOverComplete ? !isStriker : isStriker;

    // Update batsman stats
    // Efficiently update batsman, non-striker, and bowler using bulkWrite
    const bulkOps = [
        {
            updateOne: {
                filter: { _id: strikerId },
                update: {
                    $inc: {
                        runs: updation.batsman?.runs || 0,
                        ballsFaced: updation.batsman?.ballsFaced || 0,
                        wides: updation.batsman?.wides || 0,
                        legbyes: updation.batsman?.legbyes || 0,
                        byes: updation.batsman?.byes || 0,
                    },
                    $set: {
                        isStriker: isStriker,
                    },
                },
            },
        },
        {
            updateOne: {
                filter: { _id: nonStrikerId },
                update: {
                    $set: {
                        isStriker: !isStriker,
                    },
                },
            },
        },
        {
            updateOne: {
                filter: { _id: bowlerId },
                update: {
                    $inc: {
                        runs: updation.bowler?.runs || 0,
                        ballsFaced: updation.bowler?.ballsFaced || 0,
                        noballs: updation.bowler?.noballs || 0,
                        wides: updation.bowler?.wides || 0,
                        byes: updation.bowler?.byes || 0,
                        legbyes: updation.bowler?.legbyes || 0,
                    },
                },
            },
        },
    ];

    await Player.bulkWrite(bulkOps);

    // Example values for inning, over, and delivery
    const inning = currentInning.inningsType === "first" ? 1 : 2; // or however you define innings
    const updatedOversV2 = addOversV2(newOvers, updation.team?.overs || "0.0");

    const oversArray = updatedOversV2.split("."); // Splitting "3.2" into ["3", "2"]
    const overComplete = parseInt(oversArray[0], 10); // Total complete overs
    const balls = parseInt(oversArray[1], 10); // Balls in the current over
    const delivery = currentInning.deliveries + 1; // Assuming this is the next delivery (incrementing the balls)

    const ballId = `${inning}.${overComplete}.${balls}.${delivery}`;

    const mapString: { [key: string]: string } = {
        normal: "runs",
    };

    await BallByBall.create({
        ballId,
        matchId,
        over: updatedOversV2,
        ball: currentInning.balls + (updation.team?.balls || 0),
        strikerBatsmanId: strikerId,
        strikerBatsmanName: batsman?.name,
        nonStrikerBatsmanId: nonStrikerId,
        nonStrikerBatsmanName: nonStrikerBats?.name,
        bowlerId: bowlerId,
        bowlerName: bowler?.name,
        runs: updation.team.runs,
        extras: updation.team.runs,
        ballType: ballType,
        commentary: `${updation.team.runs} ${ballType !== BallType.NORMAL ? "runs" : ""} (${
            mapString[ballType as string] || ballType
        } ${ballType === BallType.OVERTHROW ? payload.overthrow : ""}) scored`,
        payload,
        isStrikerChanged: !isStriker,
        strikerBatsmanStats: {
            runs: updation.batsman?.runs,
            balls: updation.batsman?.ballsFaced || 0,
        },
        legalRuns,
        delivery,
    });

    return { batsman, bowler, match };
};

interface PlayerStats {
    runs: number;
    ballsFaced: number;
    oversBowled: number;
    bowlerEconomy: number;
}

export const calculateBattingStats = (batsman: PlayerStats, runs: number) => {
    return {
        runs: batsman.runs + runs,
        ballsFaced: batsman.ballsFaced + 1,
    };
};

export const calculateBowlingStats = (bowler: PlayerStats, runs: number, extras: string) => {
    let bowlerEconomy = bowler.bowlerEconomy;
    if (!extras) {
        bowlerEconomy += runs; // Simplified economy calculation
    }

    const oversBowled = Math.floor(bowler.oversBowled + 0.1); // Adjust overs

    return {
        oversBowled,
        bowlerEconomy,
    };
};

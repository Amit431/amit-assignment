function addOvers(overs1: string, overs2: string, isReverse: boolean = false, ballsPerOver: number = 6): string {
    const [overs1Count, balls1Count] = overs1.split(".").map(Number);
    const [overs2Count, balls2Count] = overs2.split(".").map(Number);

    // Convert total overs and balls to total balls
    const totalBalls1 = overs1Count * ballsPerOver + balls1Count;
    const totalBalls2 = (overs2Count * ballsPerOver + balls2Count) * (isReverse ? -1 : 1);

    // Sum total balls
    const totalBalls = totalBalls1 + totalBalls2;

    // Calculate the overs and remaining balls
    const totalOvers = Math.floor(totalBalls / ballsPerOver);
    const remainingBalls = totalBalls % ballsPerOver;

    // Return the result in overs format
    return `${totalOvers}.${remainingBalls}`;
}
export function addOversV2(
    overs1: string,
    overs2: string,
    isReverse: boolean = false,
    ballsPerOver: number = 6
): string {
    const [overs1Count, balls1Count] = overs1.split(".").map(Number);
    const [overs2Count, balls2Count] = overs2.split(".").map(Number);

    // Convert total overs and balls to total balls
    const totalBalls1 = overs1Count * ballsPerOver + balls1Count;
    const totalBalls2 = overs2Count * ballsPerOver + balls2Count * (isReverse ? -1 : 1);

    // Sum total balls
    const totalBalls = totalBalls1 + totalBalls2;

    // Calculate the overs and remaining balls
    let totalOvers = Math.floor(totalBalls / ballsPerOver);
    let remainingBalls = totalBalls % ballsPerOver;

    // Ensure that if balls reach 'ballsPerOver', they remain part of the previous over (e.g., 1.6)
    if (remainingBalls === 0 && totalBalls !== 0) {
        remainingBalls = ballsPerOver;
        totalOvers -= 1; // We go back one over when remainingBalls are full
    }

    // Return the result in overs format
    return `${totalOvers}.${remainingBalls}`;
}

export default addOvers;

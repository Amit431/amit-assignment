function addOvers(overs1: string, overs2: string, ballsPerOver: number = 6): string {
    const [overs1Count, balls1Count] = overs1.split(".").map(Number);
    const [overs2Count, balls2Count] = overs2.split(".").map(Number);

    // Convert total overs and balls to total balls
    const totalBalls1 = overs1Count * ballsPerOver + balls1Count;
    const totalBalls2 = overs2Count * ballsPerOver + balls2Count;

    // Sum total balls
    const totalBalls = totalBalls1 + totalBalls2;

    // Calculate the overs and remaining balls
    const totalOvers = Math.floor(totalBalls / ballsPerOver);
    const remainingBalls = totalBalls % ballsPerOver;

    // Return the result in overs format
    return `${totalOvers}.${remainingBalls}`;
}

export default addOvers;

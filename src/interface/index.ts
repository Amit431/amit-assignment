// Enum for different types of No Ball scenarios
export enum NoBallScenarios {
    LEGBYE = "noball + legbye",
    BYE = "noball + bye",
}

// Enum for different types of Wides
export enum WideScenarios {
    NORMAL = "wide", // Regular wide delivery
    RUNS = "wide + runs", // Regular wide delivery
    OVERTHROW = "wide + overthrow", // Wide delivery leading to an overthrow
}

// Enum to categorize different ball types
export enum BallType {
    NO_BALL = "no ball",
    WIDE = "wide",
    LEG_BYE = "legbye",
    BYE = "bye",
    OVERTHROW = "overthrow",
    NORMAL = "normal",
}

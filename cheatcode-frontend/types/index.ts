// Contest types
export interface SampleTestCase {
    input: string;
    expectedOutput: string;
}

export interface Question {
    _id: string;
    title: string;
    description: string;
    constraints: string[];
    sampleTestCases: SampleTestCase[];
}

export interface Contest {
    _id: string;
    title: string;
    duration: number;   // minutes
    questions: Question[];
    createdAt: string;
}

export interface ContestSummary {
    _id: string;
    title: string;
    duration: number;
    questionCount: number;
    createdAt: string;
}

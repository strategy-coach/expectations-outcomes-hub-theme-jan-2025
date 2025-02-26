export interface InitialValue {
    valueString: string;
}

export interface BaseQuestionnaireItem {
    type: string;
    linkId: string;
    text: string;
    readOnly?: boolean;
    initial?: InitialValue[];
}

export interface QuestionnaireItem extends BaseQuestionnaireItem {
    item?: QuestionnaireItem[]; // Nested items inside a question (optional)
}

export interface QuestionnaireGroup {
    type: "group"; // Ensures only "group" type for groups
    linkId: string;
    text: string;
    readOnly: boolean;
    item: QuestionnaireItem[]; // Groups contain questions/items
}

export interface Questionnaire {
    resourceType: "Questionnaire"; // Must be exactly "Questionnaire"
    title: string;
    status: string;
    item: QuestionnaireGroup[]; // Only groups at the top level
}

export interface OutputNode {
    name: string;
    path: string;
    isFile: boolean;
    children?: OutputNode[];
}

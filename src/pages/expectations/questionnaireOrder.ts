// deno-lint-ignore-file
import type {
    Questionnaire,
    OutputNode,
} from "./typs.ts";

export function convertQuestionnaire(json: Questionnaire): OutputNode {
    return {
        name: json.resourceType,
        path: "/expectations/questionnaire/",
        isFile: false,
        children: json.item.map(plan => ({
            name: plan.text,
            path: `/expectations/questionnaire/${plan.text.toLowerCase().replace(/\s+/g, "-")}/`,
            isFile: false,
            children: plan.item.map(entry => ({
                name: entry.text,
                path: entry.initial?.[0]?.valueString || "",
                isFile: true,
            }))
        }))
    };
}

export function replaceQuestionnaire(menuTree: any[], newObject: any): any[] {
    // To replace the Questionnaire menu using order json
    return menuTree.map((item) =>
        item.name === "Questionnaire" ? newObject : item
    );
}
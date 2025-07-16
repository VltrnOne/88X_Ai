// agents/intent-parser/mission-planner.js

/**
 * Generates a detailed, multi-step execution plan from a parsed intent.
 * @param {object} parsedIntent - The JSON object from the intent parser.
 * @returns {object} A structured mission plan with an array of execution steps.
 */
export function generateMissionPlan(parsedIntent) {
  console.log("[Mission-Planner] Generating execution plan for action:", parsedIntent.action);
  const executionSteps = [];

  // Logic to determine which agents to run based on the intent.
  if (parsedIntent.action === 'SEARCH_LAYOFF_EVENTS') {
    executionSteps.push({
      step: 1,
      agent: 'scout-warn',
      description: 'Acquire initial layoff data from WARN notices.'
    });
    executionSteps.push({
      step: 2,
      agent: 'marketer-agent',
      description: 'Enrich new leads from the Dataroom.'
    });
  }
  // Future intents could add different steps to this array.

  return {
    ...parsedIntent,
    generated_at: new Date().toISOString(),
    execution_steps: executionSteps,
  };
}

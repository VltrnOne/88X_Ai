// orchestrator/agent-runner.js
import { execa } from 'execa';

export async function runAgentContainer(agentName) {
  const imageName = `vltrn/${agentName}:1.0.0`;
  console.log(`[AgentRunner] Initiating agent container: ${imageName}`);

  try {
    await execa(
      'docker',
      ['run', '--rm', '--network=vltrn-system_default', '--env-file', '.env', imageName],
      { stdio: 'inherit' }
    );
    console.log(`[AgentRunner] Agent container ${imageName} finished its mission.`);
    return { success: true, message: `Agent ${agentName} completed successfully.` };
  } catch (error) {
    console.error(`[AgentRunner] Agent container ${imageName} failed during execution:`, error);
    return { success: false, message: `Agent ${agentName} failed.` };
  }
}
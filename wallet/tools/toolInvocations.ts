import {
  atomicWrite,
  type ParsedMoneroToolInvocation,
} from "@spirobel/monero-wallet-api";
export const TOOL_INVOCATION_LOG_PATH = "toolInvocations.json";
export type ToolInvocation = {
  tool: ParsedMoneroToolInvocation;
  disnavigated: boolean;
  dismissed: boolean;
};
export async function readToolInvocationLog() {
  const jsonString = await Bun.file(TOOL_INVOCATION_LOG_PATH)
    .text()
    .catch(() => undefined);
  return jsonString ? (JSON.parse(jsonString) as ToolInvocation[]) : [];
}
export async function writeToolInvocationLog(
  writeCallback: (toolInvocationLog: ToolInvocation[]) => void | Promise<void>,
) {
  const toolInvocationLog = await readToolInvocationLog();
  await writeCallback(toolInvocationLog);
  return await atomicWrite(
    TOOL_INVOCATION_LOG_PATH,
    JSON.stringify(toolInvocationLog, null, 2),
  );
}

export async function pushToolInvocation(
  toolInvocation: ParsedMoneroToolInvocation,
) {
  return await writeToolInvocationLog((toolInvocationLog) => {
    toolInvocationLog.push({
      tool: toolInvocation,
      disnavigated: false,
      dismissed: false,
    });
  });
}

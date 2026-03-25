import { atomicWrite, type MoneroTool } from "@spirobel/monero-wallet-api";
export const TOOL_INVOCATION_LOG_PATH = "toolInvocations.json";
export type LocationInfo = {
  //ancestorOrigins: Record<string, never>; // empty object in practice
  href: string;
  origin: string;
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
};
export type ToolInvocation = {
  tool: MoneroTool;
  timestamp: number;
  location: LocationInfo;
};
async function readToolInvocationLog() {
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

export async function pushToolInvocation(toolInvocation: ToolInvocation) {
  return await writeToolInvocationLog((toolInvocationLog) => {
    toolInvocationLog.push(toolInvocation);
  });
}

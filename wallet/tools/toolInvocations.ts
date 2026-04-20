import {
  atomicWrite,
  type MoneroTool,
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
  await atomicWrite(
    TOOL_INVOCATION_LOG_PATH,
    JSON.stringify(toolInvocationLog, null, 2),
  );
  return await setToolInvocationStatus();
}

export async function pushToolInvocation(
  toolInvocation: ParsedMoneroToolInvocation,
) {
  return await writeToolInvocationLog((toolInvocationLog) => {
    toolInvocationLog.forEach((v) => {
      if (v.tool.tool.tool_id === toolInvocation.tool.tool_id) {
        v.dismissed = true;
      }
    });
    toolInvocationLog.push({
      tool: toolInvocation,
      disnavigated: false,
      dismissed: false,
    });
  });
}

let toolInvocationCheckInterval: null | number | NodeJS.Timeout = null;

export function latestToolInvocations() {
  if (!toolInvocationCheckInterval) {
    setToolInvocationStatus();
    toolInvocationCheckInterval = setInterval(setToolInvocationStatus, 100);
  }
  return activeToolInvocations;
}
export type ActiveToolInvocations = Record<
  MoneroTool["tool_id"],
  ToolInvocation | undefined | null
>;
let activeToolInvocations: ActiveToolInvocations;
const tool_ids: MoneroTool["tool_id"][] = ["001", "002"];
export async function setToolInvocationStatus() {
  if (!activeToolInvocations)
    activeToolInvocations = {} as ActiveToolInvocations;
  const toolInvocationLog = await readToolInvocationLog();
  for (const tool_id of tool_ids) {
    const invo =
      toolInvocationLog
        .filter((v) => {
          return v.tool.tool.tool_id === tool_id && !v.dismissed;
        })
        .at(-1) || null;
    if (invo) {
      activeToolInvocations[tool_id] = invo;
    } else {
      activeToolInvocations[tool_id] = null;
    }
  }
}

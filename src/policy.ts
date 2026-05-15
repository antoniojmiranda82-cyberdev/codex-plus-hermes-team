import { DEFAULT_SIDE_EFFECT_POLICY, type SideEffectPolicy } from "./types.js";

export function resolveSideEffectPolicy(
  requested: SideEffectPolicy | undefined,
  fallback: SideEffectPolicy = DEFAULT_SIDE_EFFECT_POLICY
): SideEffectPolicy {
  return requested ?? fallback;
}

export function describeSideEffectPolicy(policy: SideEffectPolicy): string {
  switch (policy) {
    case "advice_only":
      return "Advice only. Do not use tools or perform side effects. Return guidance, risks, and proposed next steps.";
    case "read_only":
      return "Read-only. You may inspect/read/search if your runtime allows it, but must not write, send, publish, delete, deploy, or mutate state.";
    case "local_files_allowed":
      return "Local files allowed only when the task explicitly asks for it. Do not perform external side effects.";
    case "external_side_effects_need_approval":
      return "External side effects need explicit approval. Prepare the action and ask for confirmation before sending, publishing, deleting, buying, deploying, or messaging.";
    case "external_side_effects_allowed":
      return "External side effects are allowed only if the task explicitly requests them and they are within your normal permissions.";
  }
}

export function withSideEffectPolicy(body: string, policy: SideEffectPolicy): string {
  return [`Side-effect policy: ${policy}`, describeSideEffectPolicy(policy), "", body].join("\n");
}

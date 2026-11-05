"use client";
export type HostedAction = {
  provider?: string;
  redirectUrl?: string;
  postUrl?: string;
  fields?: Record<string, string>;
};
export function openHostedCheckout(action: HostedAction) {
  if (!["phonepe", "payu"].includes(action.provider ?? "")) return false;
  const target = action.redirectUrl ?? action.postUrl;
  if (!target) throw new Error("The gateway returned no checkout action.");
  const url = new URL(target);
  const allowed =
    action.provider === "phonepe"
      ? url.hostname.endsWith(".phonepe.com") || url.hostname === "phonepe.com"
      : ["secure.payu.in", "test.payu.in"].includes(url.hostname);
  if (url.protocol !== "https:" || url.username || url.password || !allowed)
    throw new Error("Untrusted gateway checkout address.");
  if (action.redirectUrl) window.location.assign(url.toString());
  else {
    if (
      !action.fields ||
      Object.values(action.fields).some((v) => typeof v !== "string")
    )
      throw new Error("Invalid hosted payment fields.");
    const form = document.createElement("form");
    form.method = "POST";
    form.action = url.toString();
    for (const [name, value] of Object.entries(action.fields)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.append(input);
    }
    document.body.append(form);
    form.submit();
  }
  return true;
}

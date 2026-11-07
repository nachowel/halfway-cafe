export class AdminOriginError extends Error {
  readonly status = 403;

  constructor(message: string) {
    super(message);
    this.name = "AdminOriginError";
  }
}

export function assertSameOriginMutation(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin) throw new AdminOriginError("A valid Origin header is required");

  const expectedOrigin = new URL(request.url).origin;
  if (origin !== expectedOrigin) throw new AdminOriginError("The request origin is not allowed");

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "same-site") {
    throw new AdminOriginError("Cross-site admin requests are not allowed");
  }
}

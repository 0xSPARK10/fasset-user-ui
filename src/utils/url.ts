import { ParsedUrlQuery } from "querystring";

// Next's query values are string | string[] | undefined. Only a same-site path is
// accepted: "https://…", "//host" and "/\host" would leave the app (open redirect), and so
// would "/\t/host" — the URL parser drops tabs / newlines, so control characters are rejected.
export function getRedirectPath(query: ParsedUrlQuery, fallback = "/mint"): string {
    const redirect = query.redirect;
    return typeof redirect === "string" && (/^\/(?![\/\\])[^\x00-\x1f\x7f]*$/).test(redirect)
        ? redirect
        : fallback;
}


type ConsoleBuildInfo = {
    mode: string;
    commit: string;
    branch: string;
    buildDate: string;
}

type ConsoleBuildInfoRow = [label: string, value: string];

export class ConsoleBuildBanner {
    private static logged = false;
    private readonly data: ConsoleBuildInfo;

    constructor(data: ConsoleBuildInfo) {
        this.data = data;
    }

    private getBuildInfoEntries() {
        return {
            MODE: this.data.mode || "unknown",
            COMMIT: this.data.commit || "unknown",
            BRANCH: this.data.branch || "N/A",
            BUILD_DATE: this.data.buildDate || "N/A"
        }
    }

    private buildRows(): ConsoleBuildInfoRow[] {
        return Object.entries(this.getBuildInfoEntries()) as ConsoleBuildInfoRow[];
    }

    private print(rows: ConsoleBuildInfoRow[]) {
        const title = "FAssets";
        const labelW = Math.max(...rows.map(([k]) => k.length));
        const innerW = Math.max(title.length, ...rows.map(([, v]) => labelW + 7 + v.length));
        const hr = "-".repeat(innerW + 2);
        const fmt = ([k, v]: ConsoleBuildInfoRow) =>
            `|  ${`${k}:`.padEnd(labelW + 1)}      ${v.padEnd(innerW - labelW - 7)}  |`;
        const content = [`+-${hr}-+`, `|  ${title.padEnd(innerW)}  |`, `+-${hr}-+`, ...rows.map(fmt), `+-${hr}-+`].join("\n");
        console.info(`%c${content}`, "color: #E62058; font-weight: bold; font-size: 13px")
    }

    log() {
        if (ConsoleBuildBanner.logged) return;

        ConsoleBuildBanner.logged = true;
        const rows = this.buildRows();
        this.print(rows);
    }
}


const rawInfo = process.env.BUILD_INFO;
const data: ConsoleBuildInfo = rawInfo  ?
JSON.parse(rawInfo)
: {mode: "development", commit: "unknown", branch: "unknown", buildDate: "unknown"}

export const consoleBuildBanner = new ConsoleBuildBanner(data);

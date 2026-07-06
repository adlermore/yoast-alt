import { getJob } from "@/services/crawl/job-store";
import { auditToMarkdown } from "@/lib/crawl/export/audit-markdown";
import { auditToXlsx } from "@/lib/crawl/export/audit-xlsx";
import { auditToPdf } from "@/lib/crawl/export/audit-pdf";

// exceljs / pdf-lib need the Node runtime.
export const runtime = "nodejs";

function safeHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/[^a-z0-9.-]/gi, "-");
  } catch {
    return "site";
  }
}

function download(body: BodyInit, filename: string, contentType: string): Response {
  return new Response(body, {
    headers: {
      "content-type": contentType,
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const format = new URL(request.url).searchParams.get("format") ?? "md";

  const job = getJob(id);
  if (!job || !job.result) {
    return new Response("Report not found.", { status: 404 });
  }
  if (job.result.kind !== "audit") {
    return new Response("Export is available for audit reports only.", { status: 400 });
  }

  const report = job.result;
  const generatedAt = `${new Date().toISOString().replace("T", " ").slice(0, 16)} UTC`;
  const base = `audit-${safeHost(report.baseUrl)}-${new Date().toISOString().slice(0, 10)}`;

  try {
    if (format === "md") {
      return download(auditToMarkdown(report, generatedAt), `${base}.md`, "text/markdown; charset=utf-8");
    }
    if (format === "xlsx") {
      const buffer = await auditToXlsx(report, generatedAt);
      return download(
        new Blob([new Uint8Array(buffer)]),
        `${base}.xlsx`,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
    }
    if (format === "pdf") {
      const bytes = await auditToPdf(report, generatedAt);
      return download(new Blob([new Uint8Array(bytes)]), `${base}.pdf`, "application/pdf");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed.";
    return new Response(message, { status: 500 });
  }

  return new Response("Unknown format.", { status: 400 });
}

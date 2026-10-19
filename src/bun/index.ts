import { BrowserWindow, ApplicationMenu, BrowserView } from "electrobun/bun";
import { cronService } from "./cronService";
import type { CronSavePayload } from "../types";

const PORT = 38241;

// Start local HTTP REST bridge for the webview
const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // Enable CORS for webview
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    try {
      if (url.pathname === "/api/jobs" && req.method === "GET") {
        const jobs = await cronService.getJobs();
        return new Response(JSON.stringify({ success: true, data: jobs }), { headers });
      }

      if (url.pathname === "/api/jobs" && req.method === "POST") {
        const payload = (await req.json()) as CronSavePayload;
        const result = await cronService.saveJob(payload);
        return new Response(JSON.stringify({ success: true, data: result }), { headers });
      }

      if (url.pathname.startsWith("/api/jobs/") && req.method === "DELETE") {
        const id = decodeURIComponent(url.pathname.replace("/api/jobs/", ""));
        const result = await cronService.deleteJob(id);
        return new Response(JSON.stringify({ success: true, data: result }), { headers });
      }

      return new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        headers,
      });
    } catch (err: any) {
      console.error("[Macron API Error]", err);
      return new Response(
        JSON.stringify({ success: false, error: err?.message || String(err) }),
        { status: 500, headers }
      );
    }
  },
});

console.log(`[Macron Backend] Local API bridge running on http://127.0.0.1:${server.port}`);

// Application Menu
ApplicationMenu.setApplicationMenu([
  {
    label: "Macron",
    submenu: [
      {
        label: "About Macron",
        action: "about",
      },
      { type: "separator" },
      { label: "Hide Macron", role: "hide", accelerator: "h" },
      { label: "Hide Others", role: "hideOthers" },
      { label: "Show All", role: "showAll" },
      { type: "separator" },
      { label: "Quit Macron", role: "quit", accelerator: "q" },
    ],
  },
  {
    label: "File",
    submenu: [
      {
        label: "New Job",
        accelerator: "n",
        action: "create-job",
      },
      {
        label: "Refresh Jobs",
        accelerator: "r",
        action: "refresh-jobs",
      },
    ],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "selectAll" },
    ],
  },
  {
    label: "Window",
    submenu: [
      { role: "minimize" },
      { role: "zoom" },
      { type: "separator" },
      { role: "close" },
    ],
  },
]);

// Main window creation
const mainWindow = new BrowserWindow({
  title: "macron",
  url: "views://mainview/index.html",
  frame: {
    width: 820,
    height: 580,
    x: 120,
    y: 100,
  },
});

ApplicationMenu.on("application-menu-clicked", (event: any) => {
  const action = event?.data?.action || event?.action;
  if (!action) return;

  if (action === "create-job") {
    // Notify webview to create new job
    mainWindow.executeJavascript("window.__macronCreateJob && window.__macronCreateJob();");
  } else if (action === "refresh-jobs") {
    mainWindow.executeJavascript("window.__macronRefreshJobs && window.__macronRefreshJobs();");
  }
});

console.log("[Macron] Started with Electrobun!");

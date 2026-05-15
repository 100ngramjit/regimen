import { WeeklyPlan, Workout } from "@/lib/schemas";

export type ExportFormat = "sheets" | "md" | "html" | "pdf";

export type ExportPlan =
  | { type: "single"; workout: Workout }
  | { type: "weekly"; plan: WeeklyPlan };

type ExerciseRow = {
  day: string;
  focus: string;
  section: string;
  exercise: string;
  sets: string;
  reps: string;
  duration: string;
  rest: string;
  instructions: string;
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const escapeCsv = (value: string) => `"${value.replaceAll('"', '""')}"`;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64) || "regimen";

export function getExportTitle(plan: ExportPlan) {
  return plan.type === "single" ? plan.workout.title : plan.plan.weekTitle;
}

export function getExportFilename(plan: ExportPlan, format: ExportFormat) {
  const extension = format === "sheets" ? "csv" : format;
  return `${slugify(getExportTitle(plan))}.${extension}`;
}

function getRows(plan: ExportPlan): ExerciseRow[] {
  if (plan.type === "single") {
    return plan.workout.sections.flatMap((section) =>
      section.exercises.map((exercise) => ({
        day: "Session",
        focus: plan.workout.title,
        section: section.name,
        exercise: exercise.name,
        sets: exercise.sets ?? "",
        reps: exercise.reps ?? "",
        duration: exercise.duration ?? "",
        rest: exercise.rest,
        instructions: exercise.instructions ?? "",
      })),
    );
  }

  return plan.plan.days.flatMap((day) => {
    if (day.isRest || !day.workout) {
      return [
        {
          day: day.day,
          focus: day.focus,
          section: "Recovery",
          exercise: "Rest day",
          sets: "",
          reps: "",
          duration: "",
          rest: "",
          instructions: "",
        },
      ];
    }

    return day.workout.sections.flatMap((section) =>
      section.exercises.map((exercise) => ({
        day: day.day,
        focus: day.focus,
        section: section.name,
        exercise: exercise.name,
        sets: exercise.sets ?? "",
        reps: exercise.reps ?? "",
        duration: exercise.duration ?? "",
        rest: exercise.rest,
        instructions: exercise.instructions ?? "",
      })),
    );
  });
}

export function toCsv(plan: ExportPlan) {
  const headers = [
    "Day",
    "Focus",
    "Section",
    "Exercise",
    "Sets",
    "Reps",
    "Duration",
    "Rest",
    "Instructions",
  ];

  const lines = getRows(plan).map((row) =>
    [
      row.day,
      row.focus,
      row.section,
      row.exercise,
      row.sets,
      row.reps,
      row.duration,
      row.rest,
      row.instructions,
    ]
      .map(escapeCsv)
      .join(","),
  );

  return [[...headers].map(escapeCsv).join(","), ...lines].join("\n");
}

function workoutToMarkdown(workout: Workout, headingLevel = 2) {
  const heading = "#".repeat(headingLevel);
  const sectionHeading = "#".repeat(headingLevel + 1);

  return [
    `${heading} ${workout.title}`,
    "",
    `Total time: ${workout.totalTime} minutes`,
    "",
    ...workout.sections.flatMap((section) => [
      `${sectionHeading} ${section.name}`,
      "",
      ...section.exercises.flatMap((exercise, index) => [
        `${index + 1}. **${exercise.name}**`,
        exercise.sets ? `   - Sets: ${exercise.sets}` : "",
        exercise.reps ? `   - Reps: ${exercise.reps}` : "",
        exercise.duration ? `   - Duration: ${exercise.duration}` : "",
        `   - Rest: ${exercise.rest}`,
        exercise.instructions
          ? `   - Instructions: ${exercise.instructions}`
          : "",
        "",
      ]),
    ]),
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export function toMarkdown(plan: ExportPlan) {
  if (plan.type === "single") {
    return workoutToMarkdown(plan.workout, 1);
  }

  return [
    `# ${plan.plan.weekTitle}`,
    "",
    `Goal: ${plan.plan.goal}`,
    "",
    ...plan.plan.days.flatMap((day) => {
      if (day.isRest || !day.workout) {
        return [`## ${day.day}: ${day.focus}`, "", "Rest day", ""];
      }

      return [
        `## ${day.day}: ${day.focus}`,
        "",
        workoutToMarkdown(day.workout, 3),
        "",
      ];
    }),
  ].join("\n");
}

export function toHtml(plan: ExportPlan) {
  const title = getExportTitle(plan);
  const rows = getRows(plan)
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.day)}</td>
          <td>${escapeHtml(row.focus)}</td>
          <td>${escapeHtml(row.section)}</td>
          <td>${escapeHtml(row.exercise)}</td>
          <td>${escapeHtml(row.sets)}</td>
          <td>${escapeHtml(row.reps || row.duration)}</td>
          <td>${escapeHtml(row.rest)}</td>
          <td>${escapeHtml(row.instructions)}</td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: light; }
    body {
      margin: 0;
      background: #f7f7f5;
      color: #171717;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.5;
    }
    main { max-width: 1040px; margin: 0 auto; padding: 48px 24px; }
    h1 { margin: 0 0 8px; font-size: 34px; line-height: 1.1; }
    p { margin: 0 0 28px; color: #555; }
    table { width: 100%; border-collapse: collapse; background: white; border: 1px solid #ddd; }
    th, td { padding: 12px 14px; border-bottom: 1px solid #e7e7e4; text-align: left; vertical-align: top; font-size: 13px; }
    th { background: #111; color: white; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
    tr:nth-child(even) td { background: #fbfbfa; }
    @media print {
      body { background: white; }
      main { padding: 24px 0; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
    }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(title)}</h1>
    <p>Exported from Regimen AI</p>
    <table>
      <thead>
        <tr>
          <th>Day</th>
          <th>Focus</th>
          <th>Section</th>
          <th>Exercise</th>
          <th>Sets</th>
          <th>Reps / Duration</th>
          <th>Rest</th>
          <th>Instructions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </main>
</body>
</html>`;
}

function downloadTextFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function printHtml(html: string) {
  // Create a hidden iframe to avoid popup blockers
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.name = "print_frame";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    // Fallback to direct download if iframe is not accessible
    downloadTextFile("regimen-workout.html", html, "text/html;charset=utf-8");
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  // Wait for images/styles to load then print
  const handlePrint = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    // Clean up after a delay to allow the print dialog to open
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1000);
  };

  if (iframe.contentWindow) {
    iframe.onload = handlePrint;
    // For browsers where onload might not trigger correctly for written content
    setTimeout(handlePrint, 500);
  } else {
    handlePrint();
  }
}

export function exportPlan(plan: ExportPlan, format: ExportFormat) {
  if (format === "sheets") {
    downloadTextFile(
      getExportFilename(plan, format),
      toCsv(plan),
      "text/csv;charset=utf-8",
    );
    return;
  }

  if (format === "md") {
    downloadTextFile(
      getExportFilename(plan, format),
      toMarkdown(plan),
      "text/markdown;charset=utf-8",
    );
    return;
  }

  const html = toHtml(plan);

  if (format === "pdf") {
    printHtml(html);
    return;
  }

  downloadTextFile(getExportFilename(plan, format), html, "text/html;charset=utf-8");
}

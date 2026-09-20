const fs = require('fs');

function escapePdfText(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function line(text, x, y, size = 11) {
  return `BT /F1 ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`;
}

function buildContent(report) {
  const content = [];
  let y = 760;

  content.push(line('Task Progress Report', 50, y, 22));
  y -= 26;
  content.push(line(`Generated: ${report.generated_at}`, 50, y, 10));
  y -= 30;

  const totals = report.totals;
  content.push(line('Summary', 50, y, 15));
  y -= 20;
  content.push(line(`Total tasks: ${totals.total}`, 65, y));
  y -= 16;
  content.push(line(`Done: ${totals.done}`, 65, y));
  y -= 16;
  content.push(line(`Open: ${totals.open}`, 65, y));
  y -= 16;
  content.push(line(`Overdue open tasks: ${totals.overdue}`, 65, y));
  y -= 16;
  content.push(line(`Completion rate: ${totals.completion_rate}%`, 65, y));
  y -= 30;

  content.push(line('Tasks by priority', 50, y, 15));
  y -= 20;
  report.by_priority.forEach((row) => {
    content.push(line(`${row.priority}: ${row.count}`, 65, y));
    y -= 16;
  });
  y -= 14;

  content.push(line('Task details', 50, y, 15));
  y -= 22;
  content.push(line('ID   Status   Priority   Due Date     Title', 50, y, 10));
  y -= 16;

  report.tasks.forEach((task) => {
    if (y < 70) {
      return;
    }

    const title = task.title.length > 62 ? `${task.title.slice(0, 59)}...` : task.title;
    content.push(line(
      `${String(task.id).padEnd(4)} ${task.status.padEnd(8)} ${task.priority.padEnd(10)} ${task.due_date.padEnd(12)} ${title}`,
      50,
      y,
      9
    ));
    y -= 14;
  });

  y -= 12;
  content.push(line('Artifact note: the API stores this file and returns a link instead of returning a large PDF body from the job endpoint.', 50, y, 9));

  return content.join('\n');
}

function createPdfBuffer(report) {
  const content = buildContent(report);
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${Buffer.byteLength(content, 'utf8')} >> stream\n${content}\nendstream endobj`
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object) => {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${object}\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'utf8');
}

function writeTaskReportPdf(report, outputPath) {
  const pdf = createPdfBuffer(report);
  fs.writeFileSync(outputPath, pdf);
  return pdf.length;
}

module.exports = {
  createPdfBuffer,
  writeTaskReportPdf
};

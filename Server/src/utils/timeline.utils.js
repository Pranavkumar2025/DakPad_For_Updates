export const receivedEntry = (date, block, pdfPath) => ({
  section: "Application Received",
  comment: `Received at ${block || "N/A"} on ${new Date(date).toLocaleDateString("en-GB")}`,
  date: new Date(date).toLocaleDateString("en-GB"),
  pdfLink: pdfPath,
  department: "N/A",
  officer: "N/A",
});
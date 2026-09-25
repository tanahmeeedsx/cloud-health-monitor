const nodemailer = require("nodemailer");

function required(name, value) {
  if (!value) {
    throw new Error(`Required environment variable is missing: ${name}`);
  }

  return value;
}

async function main() {
  const smtpServer = required("SMTP_SERVER", process.env.SMTP_SERVER);
  const smtpPort = Number(required("SMTP_PORT", process.env.SMTP_PORT));
  const smtpUsername = required("SMTP_USERNAME", process.env.SMTP_USERNAME);
  const smtpPassword = required("SMTP_PASSWORD", process.env.SMTP_PASSWORD);
  const recipient = required("CI_EMAIL_RECIPIENT", process.env.CI_EMAIL_RECIPIENT);

  const status = process.env.CI_STATUS || "unknown";
  const repository = process.env.GITHUB_REPOSITORY || "unknown repository";
  const workflow = process.env.GITHUB_WORKFLOW || "JavaScript CI";
  const branch = process.env.GITHUB_REF_NAME || "unknown";
  const commitSha = process.env.GITHUB_SHA || "unknown";
  const actor = process.env.GITHUB_ACTOR || "unknown";
  const serverUrl = process.env.GITHUB_SERVER_URL || "https://github.com";
  const runId = process.env.GITHUB_RUN_ID || "";

  const runUrl = runId
    ? `${serverUrl}/${repository}/actions/runs/${runId}`
    : `${serverUrl}/${repository}/actions`;

  const passed = status === "success";
  const subject = passed
    ? `✅ CI Passed — ${repository}`
    : `❌ CI Failed — ${repository}`;

  const headline = passed
    ? "The GitHub Actions CI pipeline completed successfully. Image is ready to deploy :)"
    : `The GitHub Actions CI pipeline finished with status: ${status}.`;

  const body = `${headline}

Repository: ${repository}
Workflow: ${workflow}
Branch: ${branch}
Commit: ${commitSha}
Triggered by: ${actor}

CI checks:
- ESLint code-quality linting
- Prettier formatting check
- Jest unit tests (monitoring logic + Express endpoints)
- Jest coverage threshold
- eslint-plugin-security security scan
- npm audit dependency vulnerability scan
- Docker image build

Workflow details:
${runUrl}
`;

  const transporter = nodemailer.createTransport({
    host: smtpServer,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUsername,
      pass: smtpPassword,
    },
  });

  await transporter.sendMail({
    from: smtpUsername,
    to: recipient,
    subject,
    text: body,
  });

  console.log(`CI notification sent to ${recipient}`);
}

main().catch((error) => {
  console.error("Failed to send CI notification:", error.message);
  process.exitCode = 1;
});

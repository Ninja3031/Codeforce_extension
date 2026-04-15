import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export const pushToGithub = async ({ problemName, code, language, contestId }) => {
  const owner = process.env.GITHUB_USERNAME;
  const repo = process.env.GITHUB_REPO;

  // ✅ Clean filename
  const formattedName = problemName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");

  // 🔤 Language → extension
  const getExtension = (lang = "") => {
    const l = lang.toLowerCase();
    if (l.includes("cpp") || l.includes("c++")) return "cpp";
    if (l.includes("python") || l.includes("py")) return "py";
    if (l.includes("java")) return "java";
    if (l.includes("javascript") || l.includes("js")) return "js";
    return "txt";
  };

  const extension = getExtension(language);

  // 📁 Folder structure
  const folder = contestId ? `contest_${contestId}` : "practice";

  const fileName = `${folder}/${formattedName}.${extension}`;
  const content = Buffer.from(code).toString("base64");

  try {
    // 🔍 Check if file exists
    let sha = null;

    try {
      const response = await octokit.repos.getContent({
        owner,
        repo,
        path: fileName,
        ref: "main",
      });

      if (response.data && !Array.isArray(response.data)) {
        sha = response.data.sha;
      }
    } catch (err) {
      if (err.status !== 404) throw err;
    }

    const params = {
      owner,
      repo,
      path: fileName,
      message: sha
        ? `Update solution: ${problemName}`
        : `Add solution: ${problemName}`,
      content,
    };

    if (sha) params.sha = sha;

    try {
      await octokit.repos.createOrUpdateFileContents(params);
      console.log(`✅ ${sha ? "Updated" : "Created"}:`, fileName);
    } catch (err) {
      // 🔁 Retry if SHA issue
      if (err.status === 422 && /sha wasn't supplied/i.test(err.message || "")) {
        const fresh = await octokit.repos.getContent({
          owner,
          repo,
          path: fileName,
          ref: "main",
        });

        if (!Array.isArray(fresh.data)) {
          params.sha = fresh.data.sha;
          await octokit.repos.createOrUpdateFileContents(params);
          console.log(`🔁 Retried with SHA, updated:`, fileName);
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }

  } catch (error) {
    console.error("GitHub push error:", error.message);
    throw error;
  }
};
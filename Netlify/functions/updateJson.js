/* ═══════════════════════════════════════
   Netlify Function — Update data.json via GitHub API
   Fully compatible with all admin panels
   ═══════════════════════════════════════ */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER   = process.env.REPO_OWNER;
const REPO_NAME    = process.env.REPO_NAME;
const FILE_PATH    = 'data.json';
const BRANCH       = 'main';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    // ── Validate environment ──
    const missing = [];
    if (!GITHUB_TOKEN) missing.push('GITHUB_TOKEN');
    if (!REPO_OWNER) missing.push('REPO_OWNER');
    if (!REPO_NAME)  missing.push('REPO_NAME');

    if (missing.length) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: `Missing environment variables: ${missing.join(', ')}. Add them in Netlify dashboard → Site settings → Environment variables.`
        })
      };
    }

    // ── Parse request body ──
    let newData;
    try {
      const body = JSON.parse(event.body);
      newData = body.data;
    } catch (e) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON in request body' }) };
    }

    if (!newData || typeof newData !== 'object') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No valid data object provided' }) };
    }

    // ── Encode to base64 ──
    const jsonString = JSON.stringify(newData, null, 2);
    const content = Buffer.from(jsonString).toString('base64');

    // ── Get current file SHA (if exists) ──
    let sha = null;
    try {
      const getRes = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`,
        {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'netlify-function-update-json',
          },
        }
      );
      if (getRes.ok) {
        const existing = await getRes.json();
        sha = existing.sha;
      }
    } catch (e) {
      // File doesn't exist yet — first publish
    }

    // ── Commit the new file ──
    const commitRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'netlify-function-update-json',
        },
        body: JSON.stringify({
          message: 'Update data.json via admin panel',
          content,
          sha: sha || undefined,
          branch: BRANCH,
        }),
      }
    );

    const result = await commitRes.json();

    if (commitRes.ok || commitRes.status === 201) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          commit: result.commit?.sha,
          size: jsonString.length,
          message: 'Published successfully! Netlify will auto-rebuild.'
        }),
      };
    } else {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: result.message || 'GitHub API error',
          detail: result
        }),
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

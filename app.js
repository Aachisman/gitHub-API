const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const GITHUB_USERNAME = 'YOUR_GITHUB_USERNAME';
const GITHUB_TOKEN = 'YOUR_GITHUB_TOKEN'; // Generate a GitHub personal access token

// GET /github → Show user data and repositories
app.get('/github', async (req, res) => {
  try {
    const userResponse = await axios.get(`https://api.github.com/users/${GITHUB_USERNAME}`);
    const reposResponse = await axios.get(`https://api.github.com/users/${GITHUB_USERNAME}/repos`);

    const data = {
      username: userResponse.data.login,
      name: userResponse.data.name,
      bio: userResponse.data.bio,
      followers: userResponse.data.followers,
      following: userResponse.data.following,
      public_repos: reposResponse.data.map(repo => ({
        name: repo.name,
        description: repo.description,
        url: repo.html_url
      }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data, null, 2));
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch GitHub data' });
  }
});

// GET /github/:repo → Show data about a particular repository
app.get('/github/:repo', async (req, res) => {
  const repoName = req.params.repo;
  try {
    const response = await axios.get(`https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}`);

    const data = {
      name: response.data.name,
      description: response.data.description,
      url: response.data.html_url,
      stars: response.data.stargazers_count,
      forks: response.data.forks_count,
      open_issues: response.data.open_issues_count
    };

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data, null, 2));
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch repository data' });
  }
});

// POST /github/:repo/issues → Create a new issue in a repository
app.post('/github/:repo/issues', async (req, res) => {
  const repoName = req.params.repo;
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).send({ error: 'Title and body are required' });
  }

  try {
    const response = await axios.post(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/issues`,
      { title, body },
      { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
    );

    res.send({ issue_url: response.data.html_url });
  } catch (error) {
    res.status(500).send({ error: 'Failed to create an issue' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


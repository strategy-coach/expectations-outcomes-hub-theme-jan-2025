---
title: "Github Discussions Demo"
---

# GitHub Discussions Integration  

This theme demonstrates integration with GitHub Discussions using the `github-discussions-blog-loader`.

### Setup  


1. **Configure Environment Variables**:  
   Update the `.env` file with the following values:
   - `PUBLIC_GITHUB_TOKEN`: GitHub Personal Access Token with read access to discussions.  
   - `PUBLIC_GITHUB_REPO_NAME`: Repository name.  
   - `PUBLIC_GITHUB_OWNER_NAME`: Repository owner (user or organization).  

   Example:
   ```env
   PUBLIC_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxx
   PUBLIC_GITHUB_REPO_NAME=your-repo-name
   PUBLIC_GITHUB_OWNER_NAME=your-username
   ```

2. **Use the GitHub Discussion Loader Component**:  
   Import and include the component in your Astro templates:  
   ```astro
   ---
   import GithubDiscussionLoader from "../components/github_discussion/githubDiscussion.astro";
   ---
   <GithubDiscussionLoader />
   ```
## Demo  

<a href="https://demo.hub.opsfolio.com/discussions" target="_blank">Click here to view the demo</a>  



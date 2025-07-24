---
title: "Formatting and Rendering JSON in Markdown"
---

# Formatting and Rendering JSON in Markdown

Markdown supports syntax highlighting for various programming and data languages, including JSON. To render JSON properly in a Markdown file, wrap it inside triple backticks and specify json after the opening backticks. 

This demo shows how a sample JSON object is formatted in Markdown and how it appears when rendered in a browser.

``` json
{
  "name": "John Doe",
  "age": 30,
  "isEmployed": true,
  "email": "john.doe@example.com",
  "skills": ["JavaScript", "Python", "SQL"],
  "education": {
    "degree": "B.Sc Computer Science",
    "university": "Example University",
    "graduationYear": 2015
  },
  "projects": [
    {
      "name": "Portfolio Website",
      "url": "https://johndoe.dev"
    },
    {
      "name": "Data Dashboard",
      "url": "https://dashboard.example.com"
    }
  ]
}

```



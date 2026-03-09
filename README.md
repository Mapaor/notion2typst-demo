## About this website
This is a demo website demonstrating the [notion2typst](https://www.npmjs.com/package/@nast/notion2typst) npm package and the [notionly](http://github.com/typst/packages/tree/main/packages/preview/notionly) Typst package. 

## How to use the website
What I recommend is that you fork this repository and publish it to Vercel using your `NOTION_TOKEN` as environment variable (locally in a `.env.local` file or defined inside Vercel > Project settings > Environment Variables).

You can create this token by creating a [Notion integration](https://developers.notion.com/guides/get-started/create-a-notion-integration) and connecting it to your Notion workspace.

## Note
The website is in catalan (in this case it corresponds to the Física UB Wikiblog ([fisicaubwiki.notion.site](https://fisicaubwiki.notion.site)) Notion workspace). To adapt it to your needs translate it to your language.

One could easily do a website that can be published as a static website to GitHub Pages and does the same and simply asks the notion token as input (like the notion page id), but for security reasons it's better to keep your token as an env variable and having an intermediate server performing the API call (this is a NextJS app).

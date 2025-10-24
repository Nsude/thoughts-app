# About The Project
The thoughts web app is designed to be a thinking companion of some sort, leveraging ai to help users refine their thoughts in real-time, allowing them to create multiple versions of their thoughts, invite other users to brainstorm together, and view publicly available thoughts shared by other users.

#

### Features:
- Rich Text Editor
- Thought Branching: You can create multiple versions of a thought without losing the parent thought.
- Audio Input & Transcriptions 
- AI-Powered Thought Refinement
- Real-time Collaboration: You can share your thoughts to anyone, and if they do not have account yet, they are redirected to create one then redirected to the shared thought.

#

### Tech Stack & Key components
1. NextJs: Although I'd never used NextJS until this project; reading through it's docs, I knew it was perfect for the application. The introduction of server side components, file based routing (which is not as complicated as it might sound), and built-in SEO capabilities sold me.

2. Convex: For my auth, backend and database needs, I opted to use convex; yet another technology I hadn't used before now (yeah save it, I know).

3. Slate (Rich text editor which I've also never used).

4. GSAP (for animations).

5. Resend as my email provider.

#

## My Learnings

<details>
  <summary>✨ About [Convex](https://docs.convex.dev)</summary> <br>
  When deploying a [convex app on vercel](https://docs.convex.dev/production/hosting/vercel), be sure to override the build command on vercel to be `npx convex deploy --cmd 'npm run build'` instead of the default `next build`. This ensures that your backend schemas, mutations and queries are deployed alongside the frontend hence the `-cmd npm run build`.
  
  Then you need to create a production deploy key on convex found in `settings -> URL & Deploy Key`, then set that deploy key as an enviroment variable in vercel.
  
  Also be sure to include the necessary production env variables on both convex and vercel. They are however, some variables that are only used by either convex or vercel; in that case you can just include that on the necessary platform.
  
  `✨ Noob Tip` 
  ```
  You don't need to create a different project on convex for your production enviroment, 
  the convex team already thought of that and allows a project to have dev and prod env.
  
  ```
  ---
  
  `💡IMPORTANT` <br>
  When using Github OAuth for authentification with convex, the Authorization call back URL shouldn't be set to the `.cloud` default endpoint that comes from the provided deployment URL from convex. 
  
  ```
  Deployment URL: https://gaitle-abena-396.convex.cloud
  Github Authorization callback URL: https://gaitle-abena-396.convex.site
  ```
  
  The reason for this is that the `.cloud` endpoint is reserved for backend API calls `(mutations, queries, actions, etc)` and does not have routes like `/api/auth/...`, that is set on the `.site` endpoint which hosts your app's HTTP endpoints.
  
  Be sure to include `NEXT_PUBLIC_CONVEX_URL: deplyment url from convex` as an environment variable on vercel, then `SITE_URL: domain url from vercel` on convex.
  
  
  `💡IMPORTANT` <br>
  Also set a `NEXTAUTH_URL: vercel-prod-domain-url` and `NEXTAUTH_SECRET: [generate-random-UUID](https://generate-secret.vercel.app/32)`
  
  The next-auth-url helps vercel build absolute URLs when necessary, by default NEXT regards your projects URL as `https://localhost:3000` and it auto detects this by default but on prod, you need to explicitly define your app's URL.
  
  Now the next-auth-secret on the other hand, is a special key used by vercel to encrpt all requests made by your application. If you do not set one yourself, a different one will be created on every deployment made.
</details>


<details>
  <summary>✨ About [Slate](https://docs.slatejs.org)</summary> <br>
  
  As opposed to other rich text editors, _slate_ provides a more flexible approach, they provide you with the tools you need to build whatever, it's then up to you what you do with them. This ofcourse is a gift and a curse as it has a bit of a learning curve, but it's relatively well documented and once you get a grasp of the concepts, it's incredibly easy to work with.
</details>


<details>
  <summary>✨ About [NextJS](https://nextjs.org/docs)</summary> <br>
  - When rendering lists in _NextJS/React_, you probably shouldn't use the index as the key prop, it is quite unreliable. If the list is updated in any way that affects it's length, that becomes problematic in very weird ways (and ofcourse I didn't make this rookie mistake... just sharing it 🥲).
  
  - React state's are not very reliable when used for synchronous operations, use refs in addition to the states so you can trigger a rerender and still have your application working.
</details>


<details>
  <summary>✨ About [Gemini Models](https://ai.google.dev/gemini-api/docs/models)</summary> <br>
  To get a list of the models available to you, run this command in the terminal: <br>
  
  ```
  curl "https://generativelanguage.googleapis.com/v1beta/models?key=$Your_GEMINI_API_KEY"
  
  ```
  
  Then choose a model from there that best fits your needs, you can find more info about these models from the [Gemini's Docs](https://ai.google.dev/gemini-api/docs/models)
  
  This helps you avoid runtime errors such as: <br>
  
  ```
  28/09/2025, 12:10:12 [CONVEX A(refine:refineThought)] Uncaught Error: Gemini API error: 404 - {
    "error": {
      "code": 404,
      "message": "models/gemini-1.5-flash is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.",
      "status": "NOT_FOUND"
    }
  }
  
  ```
  
  `💡IMPORTANT`
  ```
  
  The temperature parameter parsed to the generationConfig object of a request to an LLM
  controls the how strictly the LLM follows your instructions without getting creative.
  
  Most LLMS go up to 3, but 0.1 - 0.5 is great for the most reliable responses.
  
  Also, the maxOutputTokens parameter can break your logic if it's set too low and the 
  LLM doesn't have enough characters left to fit your content structure, so always set 
  it to a little more that you need.
  
  ```
</details>

With 💖💌 from Enugu

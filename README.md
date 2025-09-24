# About The Project
The thoughts web app is designed to be a thinking companion of some sort, leveraging ai to help users refine their thoughts in real-time, allowing them to create multiple versions of their thoughts, invite other users to brainstorm together, and view publicly available thoughts shared by other users.

---

### Tech Stack & Key components
1. NextJs: Although I'd never used NextJS until this project; reading through it's docs, I knew it was perfect for the application. The introduction of server side components, file based routing (which is not as complicated as complicated as it might sound), and built-in SEO capabilities sold me.

2. Convex: For my auth, backend and database needs, I opted to use convex; yet another technology I hadn't used before now (yeah save it, I know).

3. Slate (Rich text editor which I've also never used).

4. GSAP (for animations).

5. Resend as my email provider.

---

## My Learnings

About [Convex](https://docs.convex.dev)

1. When deploying a [convex app on vercel](https://docs.convex.dev/production/hosting/vercel), be sure to override the build command on vercel to be `npx convex deploy --cmd 'npm run build'` instead of the default `next build`.

This ensures that your backend schemas, mutations and queries are deployed alongside the frontend hence the `-cmd npm run build`.

Then you need to create a production deploy key on convex found in `settings -> URL & Deploy Key`, then set that deploy key as an enviroment variable in vercel.

Also be sure to include the necessary production env variables on both convex and vercel. They are however, some variables that are only used by either convex or vercel; in that case you can just include that on the necessary platform.


`💡IMPORTANT` <br>
2. When using Github OAuth for authentification with convex, the Authorization call back URL shouldn't be set to the `.cloud` default endpoint that comes from the provided deployment URL from convex. 

```
Deployment URL: https://gaitle-abena-396.convex.cloud
Github Authorization callback URL: https://gaitle-abena-396.convex.site
```

The reason for this is that the `.cloud` endpoint is reserved for backend API calls `(mutations, queries, actions, etc)` and does not have routes like `/api/auth/...`, that is set on the `.site` endpoint which hosts your app's HTTP endpoints.

3. Be sure to include `NEXT_PUBLIC_CONVEX_URL: deplyment url from convex` as an environment variable on vercel, then `SITE_URL: domain url from vercel` on convex.


`💡IMPORTANT` <br>
Also set a `NEXTAUTH_URL: vercel-prod-domain-url` and `NEXTAUTH_SECRET: [generate-random-UUID](https://generate-secret.vercel.app/32)`

The next-auth-url helps vercel build absolute URLs when necessary, by default NEXT regards your projects URL as `https://localhost:3000` and it auto detects this by default but on prod, you need to explicitly define your app's URL.

Now the next-auth-secret on the other hand, is a special key used by vercel to encrpt all requests made by your application. If you do not set one yourself, a different one will be created on every deployment made.

---

About [Slate](https://docs.slatejs.org):

As opposed to other rich text editors, _slate_ provides a more flexible approach, they provide you with the tools you need to build whatever, it's then up to you what you do with them. This ofcourse is a gift and a curse as it has a bit of a learning curve, but it's relatively well documented and once you get a grasp of the concepts, it's incredibly easy to work with.

---

About [NextJS](https://nextjs.org/docs):

- When rendering lists in _NextJS/React_, you probably shouldn't use the index as the key prop, it is quite unreliable. If the list is updated in any way that affects it's length, that becomes problematic in very weird ways (and ofcourse I didn't make this rookie mistake... just sharing it 🥲).

- React state's are not very reliable when used for synchronous operations, use refs in addition to the states so you can trigger a rerender and still have your application working.

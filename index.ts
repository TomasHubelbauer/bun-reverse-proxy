const file = Bun.file('/etc/hosts');
const text = await file.text();
const lines = text.split('\n');
const regex = /^127\.0\.0\.1 (?<name>\w+)\.localhost \# (?<port>\d+)$/;
const matches = lines.map(line => line.match(regex)).filter(Boolean);
const entries = matches.map(match => [match.groups.name, +match.groups.port]);
const map = Object.fromEntries(entries);

console.log(
  Bun.serve({
    port: 80,
    async fetch(request) {
      const hostname = new URL(request.url).hostname;
      if (!hostname.endsWith('.localhost')) {
        return new Response('Not Found - not .localhost', { status: 404 });
      }

      const name = hostname.slice(0, -'.localhost'.length);
      if (!map[name]) {
        return new Response('Not Found - not in /etc/hosts map', { status: 404 });
      }

      const url = new URL(request.url);
      url.hostname = 'localhost';
      url.port = map[name].toString();

      return await fetch(new Request(url, request));
    },
  }).url.href
);

// Tell TypeScript this file can use TLA
// Note that `module` and `target` in `tsconfig.json` nor `type` in `package.json` helped
export { };

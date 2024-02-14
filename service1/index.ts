console.log(
  Bun.serve({
    port: 7001,
    fetch() {
      return new Response('This is service 1!');
    },
  }).url.href
);

console.log(
  Bun.serve({
    port: 7002,
    fetch() {
      return new Response('This is service 2!');
    },
  }).url.href
);

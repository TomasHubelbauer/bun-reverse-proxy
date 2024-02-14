# Bun Reverse Proxy

This repository intends to demonstrate using Bun as a reverse proxy and binding
it to port 80 so that multiple other services running at their own ports can be
accessed via a plain host name.

The idea is that the Bun reverse proxy binds to port 80 and it keeps a list of
services and their corresponding ports that are running on the same macOS system
and those services also have their own corresponding `/etc/hosts` entries all
being mapped to the loopback address.

`/etc/hosts`:
```
127.0.0.1 service1.localhost # 7001
127.0.0.1 service2.localhost # 7002
```

The `/etc/hosts` file can be edited by running `sudo code /etc/hosts`.
The file requires `sudo` for writing (it can be read without it), but VS Code
recognizes this and will offer to retry with `sudo` when saving.

I am opting to use the end of line comments in the hosts file as the "database"
of services for the Bun reverse proxy to discover so there is a single source of
truth and not two places that can go out of sync (the hosts file for the mapping
to loopback and whatever other mechanism would there be for the reverse proxy to
map the host names to port names on `localhost`).

When the user accesses `service1.localhost` or `service2.localhost` in their
browser, the reverse proxy will intercept the request (being bound to port 80,
the default for HTTP) and will inspect the host name to see what address to
forward the request to and proxy the response for.

They all use the `*.localhost` TLD so they are treated as a secure context by
the browser and do not need an HTTPS certificate to use modern web features.
https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts

I have added sample `service1` and `service2` directories for quick testing.
Those services can be started by `cd service#` followed by `bun .`.

VS Code Integrated Terminal allows doing multiple ones to run these in parallel.

Bun is used because it has a nice built-in HTTP API unlike Node.

In development, run the reverse proxy using `bun --hot run .`.
In "production" (running it in the background on the computer), build it and run
the executable and detach: `bun build . --compile --outfile reverse-proxy` and
then `./reverse-proxy &`.

If the "production" instance is already running, `bun run` will fail to start
because the server will fail to bind to the already taken port 80.
Kill the "production" instance first using `pkill reverse-proxy`.

I have extracted this command to the `start` package script so it can be run
using `bun start`.

There is also `bun run build` for making and starting the "production" instance.

The same way, the "production" instance won't run if the development one is
bound to the port 80, so treat running the development instance and building and
running the "production" instance as mutually exclusive.

With this setup, it is possible to run several custom local applications each on
its own port but access them via user-friendly names and do it using super small
tooling (just Bun and the compiled reverse proxy binary) and standard approaches
(the hosts file).

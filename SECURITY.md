# Security policy

## Scope

These packages ship static SVG markup and metadata. The realistic risk is markup injected into
an icon that ends up inlined in a consumer's DOM — `@shakdaniel/react` renders icon bodies
with `dangerouslySetInnerHTML`, and `toSvg()` returns a raw string.

That is why `npm run lint:icons` rejects `<script>`, `<image>`, `<foreignObject>`, inline `on*`
handlers and external URLs in every source file, and why the test suite re-checks the generated
output. CI runs both on every PR.

## Reporting a vulnerability

Report privately through GitHub's
[security advisories](https://github.com/shakdaniel/crypto-elements/security/advisories/new)
rather than a public issue. Expect an acknowledgement within 72 hours.

Please include the icon or API involved, a reproduction, and the version you're on.

## Supported versions

The latest minor release. Fixes ship forward, not as backports.

# @shakdaniel/core

Framework-agnostic SVG logos for crypto chains, DEXes and protocols.

```bash
npm i @shakdaniel/core
```

```ts
import { toSvg, toDataUri, getIcon, icons } from '@shakdaniel/core'

document.body.innerHTML = toSvg('uniswap', { size: 32 })
el.style.backgroundImage = `url("${toDataUri('SOL', { size: 20 })}")`

getIcon('bsc')?.name // "BNB Chain"
icons.length
```

Full docs: https://github.com/shakdaniel/crypto-elements

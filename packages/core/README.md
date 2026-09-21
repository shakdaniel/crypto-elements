# @crypto-elements/core

Framework-agnostic SVG logos for crypto chains, DEXes and protocols.

```bash
npm i @crypto-elements/core
```

```ts
import { toSvg, toDataUri, getIcon, icons } from '@crypto-elements/core'

document.body.innerHTML = toSvg('uniswap', { size: 32 })
el.style.backgroundImage = `url("${toDataUri('SOL', { size: 20 })}")`

getIcon('bsc')?.name // "BNB Chain"
icons.length
```

Full docs: https://github.com/shakdaniel/crypto-elements

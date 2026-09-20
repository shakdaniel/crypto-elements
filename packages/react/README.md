# @crypto-elements/react

React components for crypto chain, DEX and protocol logos.

```bash
npm i @crypto-elements/react
```

```tsx
import { UniswapIcon, EthIcon, ChainIcon } from '@crypto-elements/react'

<UniswapIcon size={32} />
<EthIcon size={20} mono className="text-zinc-500" />
<ChainIcon id="BASE" size={16} title="Base" />
```

Named components tree-shake; `<CryptoIcon id="…" />` bundles the whole set.

Full docs: https://github.com/shakdaniel/crypto-elements

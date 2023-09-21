# How to use `zkRouting-sdk`

You can use `zkRouting-sdk` to transfer any FRC-20 asset (including FRA) on Findora Smart Chain from Address A to Address B, and remove the link between the two addresses. Both addresses can be classical user address or contract address. 

---

### Installation

```bash
npm install zk-routing-sdk
```

### Requirement wasm package

- Add [findora-wallet-wasm](https://github.com/FindoraNetwork/wasm-js-bindings) into your project

- Install the wasm into your `package.json` as a dependency
```json
// package.json
{
  // ...
  "dependencies": {
    "findora-wallet-wasm": "https://github.com/FindoraNetwork/wasm-js-bindings#develop",
  }
  // ...
}
```

### Usage
- #### [Documentation](https://docs.findora.org/developers/sdks/zkRouting-sdk)

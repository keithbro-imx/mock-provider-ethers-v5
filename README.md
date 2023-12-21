# mock-provider-ethers-v5

## Usage

Mock a call to the getApproved method, with one input and one output.

```ts
const mockProvider = new MockProvider(ERC721ABI).mockEthCall(
  'getApproved',
  [tokenId],
  ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045']
)
```

Mock a call to the quoteExactInputSingle method, with a single tuple input and multiple outputs.

```ts
const provider = new MockProvider(QuoterABI).mockEthCall(
  'quoteExactInputSingle',
  [
    {
      tokenIn: WETH_TEST_TOKEN.address,
      tokenOut: IMX_TEST_TOKEN.address,
      amountIn: '1000000000000000000',
      fee: '10000',
      sqrtPriceLimitX96: '0',
    },
  ],
  [expectedAmountOut, '100', '1', expectedGasEstimate]
)
```

Mock a revert.

```ts
const mockProvider = new MockProvider(ERC721ABI).mockEthCall(
  'getApproved',
  [tokenId],
  new Error('Call reverted')
)
```

# mock-provider-ethers-v5

## Usage

```ts
const provider = new MockProvider(QuoterABI).mockEthCall('quoteExactInputSingle', [{
    tokenIn: WETH_TEST_TOKEN.address,
    tokenOut: IMX_TEST_TOKEN.address,
    amountIn: '1000000000000000000',
    fee: '10000',
    sqrtPriceLimitX96: '0',
}], [
    expectedAmountOut,
    '100',
    '1',
    expectedGasEstimate,
]);
```

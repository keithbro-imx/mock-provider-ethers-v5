import { expect, test } from 'vitest'
import { MockProvider } from '.';

const abi = [
  {
    constant: true,
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'getApproved',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
];

test('it returns the mocked data', async () => {
  const provider = new MockProvider(abi);
  provider.mockEthCall('getApproved', [1], ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045']);

  await expect(provider.request({
    method: 'eth_call',
    params: [{ data: '0x081812fc0000000000000000000000000000000000000000000000000000000000000001' }],
  })).resolves.toEqual('0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045');
});

test('it reverts when mocked with an error', async () => {
  const provider = new MockProvider(abi);
  provider.mockEthCall('getApproved', [1], new Error('something bad'));

  await expect(provider.request({
    method: 'eth_call',
    params: [{ data: '0x081812fc0000000000000000000000000000000000000000000000000000000000000001' }],
  })).rejects.toEqual(new Error('something bad'));
});

test('it returns a hardcoded chain ID', async () => {
  const provider = new MockProvider(abi);

  await expect(provider.request({
    method: 'eth_chainId',
  })).resolves.toEqual(12345);
});

test('it rejects with unexpected eth_call when no mock was given', async () => {
  const provider = new MockProvider(abi);

  await expect(provider.request({
    method: 'eth_call',
    params: [{ data: '0x081812fc0000000000000000000000000000000000000000000000000000000000000001' }],
  })).rejects.toEqual(new Error('unexpected eth_call for getApproved'));
});

test('it rejects when the called function does not exist in the ABI', async () => {
  const provider = new MockProvider(abi);

  await expect(provider.request({
    method: 'eth_call',
    params: [{ data: '0x123456789' }],
  })).rejects.toEqual(new Error('unexpected eth_call for 0x123456789'));
});

test('it rejects when the mocked function does not exist in the ABI', async () => {
  const provider = new MockProvider(abi);

  expect(() => provider.mockEthCall('myMethod', [], [])).toThrow(new Error('function "myMethod" does not exist on ABI'));
});

test('it rejects when the function arguments do not match the ABI', async () => {
  const provider = new MockProvider(abi);

  expect(() => provider.mockEthCall('getApproved', [], [])).toThrow(new Error('invalid function arguments for getApproved'));
});


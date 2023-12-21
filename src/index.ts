import { Fragment, Interface, JsonFragment } from "@ethersproject/abi";

export class UnexpectedEthCall extends Error {
  constructor(calldata: string, method?: string) {
    super(`unexpected eth_call for ${method || calldata}`);
  }
}

export class InvalidFunctionData extends Error {
  constructor(method: string, args: any[], err: Error) {
    super(`invalid function arguments for ${method}`);
    this.stack = err.stack;
  }
}

export class InvalidFunction extends Error {
  constructor(method: string) {
    super(`function "${method}" does not exist on ABI`);
  }
}

export class MockProvider {
  requestResponse = new Map<string, string | Error>();
  iface: Interface;

  constructor(abi: string | ReadonlyArray<Fragment | JsonFragment | string>) {
    this.iface = new Interface(abi);
  }

  async request(request: { method: string, params?: any }) {
    switch (request.method) {
      case 'eth_call':
        return this.ethCall(request.params);
      case 'eth_chainId':
        return 12345;
      case 'net_version':
        return 12345;
      default:
        throw new Error('Method not implemented');
    }
  }

  private ethCall(params: [{ to: string, data: string }]) {
    const response = this.requestResponse.get(params[0].data);
    if (response instanceof Error) throw response;
    if (response) return response;

    const matchingFragment = this.iface.fragments.find((fragment) => {
      try {
        this.iface.decodeFunctionData(fragment.name, params[0].data);
        return true;
      } catch (err) {
        return false;
      }
    });

    if (matchingFragment) {
      const err = new UnexpectedEthCall(params[0].data, matchingFragment.name);
      console.warn(err.message);
      console.log(this.iface.decodeFunctionData(matchingFragment.name, params[0].data).params);
      throw err;
    } else {
      const err = new UnexpectedEthCall(params[0].data);
      console.warn(err.message);
      throw err;
    }
  }

  mockEthCall(expectedMethod: string, expectedArgs: any[], result: any[] | Error): MockProvider {
    const request = this.encodeFunctionData(expectedMethod, expectedArgs);

    if (result instanceof Error) {
      this.requestResponse.set(request, result);
    } else {
      const response = this.iface.encodeFunctionResult(expectedMethod, result);
      this.requestResponse.set(request, response);
    }

    return this;
  }

  private encodeFunctionData(expectedMethod: string, expectedArgs: any[]) {
    try {
      return this.iface.encodeFunctionData(expectedMethod, expectedArgs);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.startsWith('no matching function')) {
          throw new InvalidFunction(expectedMethod);
        }
        if (err.message.startsWith('types/values length mismatch')) {
          throw new InvalidFunctionData(expectedMethod, expectedArgs, err);
        }
      }
      throw err;
    }
  }
}

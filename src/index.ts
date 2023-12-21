import { Fragment, Interface, JsonFragment } from "@ethersproject/abi";

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
      console.log(`No matching call for ${matchingFragment.name}`);
      console.log(this.iface.decodeFunctionData(matchingFragment.name, params[0].data).params);
    } else {
      console.log(`No matching fragment for ${params[0].data}`);
    }

    throw new Error('Unexpected eth_call');
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
        throw new Error(`Failed to mockEthCall for ${expectedMethod} - ${err.message}`);
      } else {
        throw err;
      }
    }
  }
}

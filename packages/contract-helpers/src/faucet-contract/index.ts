import { providers } from 'ethers';
import BaseService from '../commons/BaseService';
import {
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  LendingPoolMarketConfig,
  tEthereumAddress,
  transactionType,
} from '../commons/types';
import { DEFAULT_NULL_VALUE_ON_TX } from '../commons/utils';
import { FaucetValidator } from '../commons/validators/methodValidators';
import { isEthAddress } from '../commons/validators/paramValidators';
import { IFaucet } from './typechain/IFaucet';
import { IFaucet__factory } from './typechain/IFaucet__factory';

export type FaucetParamsType = {
  userAddress: tEthereumAddress;
};

export interface FaucetInterface {
  mint: (args: FaucetParamsType) => EthereumTransactionTypeExtended[];
}

export class FaucetService
  extends BaseService<IFaucet>
  implements FaucetInterface
{
  readonly faucetAddress: string;

  readonly faucetConfig: LendingPoolMarketConfig | undefined;

  constructor(provider: providers.Provider, faucetAddress?: string) {
    super(provider, IFaucet__factory);

    this.faucetAddress = faucetAddress ?? '';
  }

  @FaucetValidator
  public mint(
    @isEthAddress('userAddress')
    { userAddress }: FaucetParamsType,
  ): EthereumTransactionTypeExtended[] {
    const faucetContract = this.getContractInstance(this.faucetAddress);
    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: async () => faucetContract.populateTransaction.mintAll(),
      from: userAddress,
      value: DEFAULT_NULL_VALUE_ON_TX,
    });

    return [
      {
        tx: txCallback,
        txType: eEthereumTxType.FAUCET_MINT,
        gas: this.generateTxPriceEstimation([], txCallback),
      },
    ];
  }

  public async lastMintTime(
    @isEthAddress('userAddress')
    { userAddress }: FaucetParamsType,
  ) {
    const faucetContract = this.getContractInstance(this.faucetAddress);

    return faucetContract.lastMintTime(userAddress);
  }
}

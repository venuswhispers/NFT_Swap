import type { Signer } from '@ethersproject/abstract-signer';
import type { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import type { BytesLike } from '@ethersproject/bytes';
import type { IZeroEx } from '../../contracts';

export type FeeStruct = {
  recipient: string;
  amount: BigNumberish;
  feeData: BytesLike;
};

export type PropertyStruct = {
  propertyValidator: string;
  propertyData: BytesLike;
};

export type ERC1155OrderStruct = {
  direction: BigNumberish;
  maker: string;
  taker: string;
  expiry: BigNumberish;
  nonce: BigNumberish;
  erc20Token: string;
  erc20TokenAmount: BigNumberish;
  fees: FeeStruct[];
  erc1155Token: string;
  erc1155TokenId: BigNumberish;
  erc1155TokenProperties: PropertyStruct[];
  erc1155TokenAmount: BigNumberish;
};

export type ERC721OrderStruct = {
  direction: BigNumberish;
  maker: string;
  taker: string;
  expiry: BigNumberish;
  nonce: BigNumberish;
  erc20Token: string;
  erc20TokenAmount: BigNumberish;
  fees: FeeStruct[];
  erc721Token: string;
  erc721TokenId: BigNumberish;
  erc721TokenProperties: PropertyStruct[];
};

export type UserFacingFeeStruct = {
  recipient: string;
  amount: BigNumberish;
  // Make fee data optional for devx (most folks don't use the feeData arg and it _needs_ to be '0x' if not being used).
  // automatically defaults to '0x'
  feeData?: BytesLike;
};

export interface OrderStructOptionsCommon {
  direction: BigNumberish;
  maker: string;
  taker: string;
  expiry: Date | number;
  nonce: BigNumberish;
  // erc20Token: string;
  // erc20TokenAmount: BigNumberish;
  fees: UserFacingFeeStruct[];
  tokenProperties: PropertyStruct[];
}

export interface OrderStructOptionsCommonStrict {
  direction: BigNumberish;
  // erc20Token: string;
  // erc20TokenAmount: BigNumberish;
  maker: string;
  taker?: string;
  expiry?: Date | number;
  nonce?: BigNumberish;
  fees?: UserFacingFeeStruct[];
  tokenProperties?: PropertyStruct[];
}

interface OrderStructPropertyOptions {
  tokenProperties: PropertyStruct[];
}

export interface Fee {
  recipient: string;
  amount: BigNumber;
  feeData: string;
}

export interface Property {
  propertyValidator: string;
  propertyData: string;
}

export type NftOrderV4 = ERC1155OrderStruct | ERC721OrderStruct;

export interface SignedERC721OrderStruct extends ERC721OrderStruct {
  signature: SignatureStruct;
}

export interface SignedERC1155OrderStruct extends ERC1155OrderStruct {
  signature: SignatureStruct;
}

export type SignedNftOrderV4 =
  | SignedERC721OrderStruct
  | SignedERC1155OrderStruct;

export type ECSignature = {
  v: BigNumberish;
  r: BytesLike;
  s: BytesLike;
};

export type SignatureStruct = {
  signatureType: BigNumberish; // 2 for EIP-712
  v: BigNumberish;
  r: BytesLike;
  s: BytesLike;
};

export interface ApprovalOverrides {
  signer: Signer;
  approve: boolean;
  exchangeContractAddress: string;
  chainId: number;
}

export interface FillOrderOverrides {
  signer: Signer;
  exchangeContract: IZeroEx;
  tokenIdToSellForCollectionOrder?: BigNumberish;
  /**
   * Fill order with native token if possible
   * e.g. If taker asset is WETH, allows order to be filled with ETH
   */
  fillOrderWithNativeTokenInsteadOfWrappedToken: boolean;
}

export interface BuildOrderAdditionalConfig {
  direction: BigNumberish;
  maker: string;
  taker: string;
  expiry: BigNumberish;
  nonce: BigNumberish;
}

export type AvailableSignatureTypes = 'eoa'; // No EIP-1271 / preSign yet (soon though)

export interface SigningOptions {
  signatureType: AvailableSignatureTypes; // | 'autodetect' ? and remove autodetectSignatureType maybe?
  autodetectSignatureType: boolean;
}

// Typings for addresses.json file
export interface AddressesForChain {
  exchange: string;
  wrappedNativeToken: string;
}

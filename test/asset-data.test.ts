import { InfuraProvider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { AssetProxyId, NftSwap, SupportedTokenTypes, SwappableAsset, UserFacingERC1155AssetDataSerialized, UserFacingERC1155AssetDataSerializedNormalizedSingle, UserFacingERC20AssetDataSerialized } from '../src';
import { convertDecodedAssetDataToUserFacingAssets, getAssetsFromOrder, hashOrder } from '../src/sdk/pure';
import {
  decodeAssetData,
  decodeErc1155AssetData,
  decodeErc20AssetData,
  decodeErc721AssetData,
  decodeMultiAssetData,
  encodeAssetData,
} from '../src/utils/asset-data';
import { NULL_ADDRESS } from '../src/utils/eth';

jest.setTimeout(60 * 1000);

const MAKER_WALLET_ADDRESS = '0xabc23F70Df4F45dD3Df4EC6DA6827CB05853eC9b';
const MAKER_PRIVATE_KEY =
  'fc5db508b0a52da8fbcac3ab698088715595f8de9cccf2467d51952eec564ec9';
// NOTE(johnrjj) - NEVER use these private keys for anything of value, testnets only!

// TODO(johnrjj) - When Rinkeby faucet is working, separate out swap into two accounts.
// Right now we'll just trade between the same account (it works for testing purposes)
// const TAKER_WALLET_ADDRESS = "0xaaa1388cD71e88Ae3D8432f16bed3c603a58aD34";
// const TAKER_PRIVATE_KEY =
//   "a8d6d0643c732663bf5221f83df806a59ed54dbd9be02e226b1a11ff4de83de8";

const WMATIC_TOKEN_ADDRESS_TESTNET =
  '0x9c3c9283d3e44854697cd22d3faa240cfb032889';
const DAI_TOKEN_ADDRESS_TESTNET = '0x001b3b4d0f3714ca98ba10f6042daebf0b1b7b6f';

const RPC_TESTNET =
  'https://polygon-mumbai.g.alchemy.com/v2/VMBpFqjMYv2w-MWnc9df92w3R2TpMvSG';

const MAKER_WALLET = new ethers.Wallet(MAKER_PRIVATE_KEY);
// const TAKER_WALLET = new ethers.Wallet(TAKER_PRIVATE_KEY);

const PROVIDER = new ethers.providers.StaticJsonRpcProvider(RPC_TESTNET);

const MAKER_SIGNER = MAKER_WALLET.connect(PROVIDER);
// const TAKER_PROVIDER = TAKER_WALLET.connect(PROVIDER);

const nftSwap = new NftSwap(MAKER_SIGNER as any, MAKER_SIGNER, 80001);
// const nftSwapperTaker = new NftSwap(TAKER_PROVIDER as any, 4);

const TAKER_ASSET: SwappableAsset = {
  type: 'ERC20',
  tokenAddress: WMATIC_TOKEN_ADDRESS_TESTNET,
  amount: '10000000000000000', // 1 WMATIC
};
const MAKER_ASSET: SwappableAsset = {
  type: 'ERC20',
  tokenAddress: DAI_TOKEN_ADDRESS_TESTNET,
  amount: '10000000000000000', // 1 DAI
};


describe('NFTSwap', () => {
  it('decodes encoded multi-asset data', async () => {

    const nft1Address = '0x631998e91476da5b870d741192fc5cbc55f5a52e';
    const testNft1: SwappableAsset = {
      type: 'ERC1155',
      tokenAddress: nft1Address,
      tokenId: '65638',
      amount: '14',
    };

    // https://testnets.opensea.io/assets/0xfa85acaaff1d2fd159aa8454222da76bdf8fa956/3
    const erc20Address = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174';
    const testErc20: SwappableAsset = {
      type: 'ERC20',
      tokenAddress: erc20Address,
      amount: '100000',
    };

    const order = nftSwap.buildOrder([], [testErc20, testNft1], NULL_ADDRESS);

    const decodedTakerAssetData = decodeAssetData(order.takerAssetData)

    const userFacingTakerAssets = convertDecodedAssetDataToUserFacingAssets(decodedTakerAssetData, order.takerAssetAmount);

    const decodedErc20 = userFacingTakerAssets[0] as UserFacingERC20AssetDataSerialized;
    const decodedErc1155 = userFacingTakerAssets[1] as UserFacingERC1155AssetDataSerializedNormalizedSingle;
    expect(decodedErc20.type).toBe(SupportedTokenTypes.ERC20)
    expect(decodedErc20.amount).toBe(testErc20.amount)
    expect(decodedErc20.tokenAddress.toLowerCase()).toBe(testErc20.tokenAddress.toLowerCase())

    expect(decodedErc1155.type).toBe(SupportedTokenTypes.ERC1155)
    expect(decodedErc1155.amount).toBe(testNft1.amount)
    expect(decodedErc1155.tokenAddress).toBe(testNft1.tokenAddress)
    expect(decodedErc1155.tokenId).toBe(testNft1.tokenId)

    const { takerAssets } = getAssetsFromOrder(order);

    const userFacingTakerAssets2 = takerAssets;
    const decodedErc20_2 = userFacingTakerAssets2[0]  as UserFacingERC20AssetDataSerialized;
    const decodedErc1155_2 = userFacingTakerAssets2[1] as UserFacingERC1155AssetDataSerializedNormalizedSingle;

    expect(decodedErc20_2.type).toBe(SupportedTokenTypes.ERC20)
    expect(decodedErc20_2.amount).toBe(testErc20.amount)
    expect(decodedErc20_2.tokenAddress.toLowerCase()).toBe(testErc20.tokenAddress.toLowerCase())

    expect(decodedErc1155_2.type).toBe(SupportedTokenTypes.ERC1155)
    expect(decodedErc1155_2.amount).toBe(testNft1.amount)
    expect(decodedErc1155_2.tokenAddress).toBe(testNft1.tokenAddress)
    expect(decodedErc1155_2.tokenId).toBe(testNft1.tokenId)
  });

  it('decodes encoded single-asset data (erc20)', async () => {

    const nft1Address = '0x631998e91476da5b870d741192fc5cbc55f5a52e';
    const testNft1: SwappableAsset = {
      type: 'ERC1155',
      tokenAddress: nft1Address,
      tokenId: '65638',
      amount: '14',
    };

    // https://testnets.opensea.io/assets/0xfa85acaaff1d2fd159aa8454222da76bdf8fa956/3
    const erc20Address = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174';
    const testErc20: SwappableAsset = {
      type: 'ERC20',
      tokenAddress: erc20Address,
      amount: '100000',
    };

    const order = nftSwap.buildOrder([], [testErc20], NULL_ADDRESS);

    const decodedTakerAssetData = decodeAssetData(order.takerAssetData)

    const userFacingTakerAssets = convertDecodedAssetDataToUserFacingAssets(decodedTakerAssetData, order.takerAssetAmount);

    expect(userFacingTakerAssets.length).toBe(1);
    const decodedErc20 = userFacingTakerAssets[0] as UserFacingERC20AssetDataSerialized;
    expect(decodedErc20.type).toBe(SupportedTokenTypes.ERC20)
    expect(decodedErc20.amount).toBe(testErc20.amount)
    expect(decodedErc20.tokenAddress.toLowerCase()).toBe(testErc20.tokenAddress.toLowerCase())

    const { takerAssets } = getAssetsFromOrder(order);

    const userFacingTakerAssets2 = takerAssets;
    expect(userFacingTakerAssets2.length).toBe(1);
    const decodedErc20_2 = userFacingTakerAssets2[0]  as UserFacingERC20AssetDataSerialized;

    expect(decodedErc20_2.type).toBe(SupportedTokenTypes.ERC20)
    expect(decodedErc20_2.amount).toBe(testErc20.amount)
    expect(decodedErc20_2.tokenAddress.toLowerCase()).toBe(testErc20.tokenAddress.toLowerCase())

  });
});

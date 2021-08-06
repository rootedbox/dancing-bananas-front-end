import { EthNetwork, NetworkIds } from '@sommelier/shared-types';

export type Environments = 'production' | 'development' | 'test' | 'staging';
type ContractABI =
    | 'ADD_LIQUIDITY'
    | 'REMOVE_LIQUIDITY'
    | 'TWO_SIDE_ADD_LIQUIDITY'
    | 'ADD_LIQUIDITY_V3'
    | 'BATCH_LIQUIDITY_V3';

type Network = {
    [key in NetworkIds]: {
        id: number;
        name: EthNetwork;
        contracts?: Partial<
            {
                [key in ContractABI]: string;
            }
        >;
    };
};

type Redis = {
    host: string;
    port: number;
    db: number;
    password: string;
};

export default interface AppConfig {
    wsApi: string;
    redis: Redis;
    networks: Network;
    ethAddress: string;
    etherscanApiKey: string;
}

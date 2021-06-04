import {
    useState,
    useContext,
    createContext,
    Dispatch,
    SetStateAction,
} from 'react';
import { PoolSearch } from 'components/pool-search';
import { Box } from '@material-ui/core';
import { AddLiquidityV3 } from 'components/add-liquidity/add-liquidity-v3';
import { useBalance } from 'hooks/use-balance';
import { usePoolOverview, useTopPools } from 'hooks/data-fetchers';
import { useWallet } from 'hooks/use-wallet';
import { debug } from 'util/debug';
import { EthGasPrices } from '@sommelier/shared-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCog } from '@fortawesome/free-solid-svg-icons';
import './liquidity-container.scss';
import { ThreeDots } from 'react-loading-icons';
import classNames from 'classnames';

import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';

export enum GasPriceSelection {
    Standard = 'standard',
    Fast = 'fast',
    Fastest = 'fastest',
}

type LiquidityContext = {
    poolId: string | null;
    selectedGasPrice: GasPriceSelection;
    slippageTolerance: number;
    setPoolId: Dispatch<SetStateAction<string | null>>;
    setSelectedGasPrice: Dispatch<SetStateAction<GasPriceSelection>>;
    setSlippageTolerance: Dispatch<SetStateAction<number>>;
};

const initialContext = {
    poolId: null,
    selectedGasPrice: GasPriceSelection.Standard,
    slippageTolerance: 3.0,
};
export const LiquidityContext = createContext<Partial<LiquidityContext>>(
    initialContext,
);

const SearchHeader = ({
    setPoolId,
}: {
    setPoolId: Dispatch<SetStateAction<string | null>>;
}) => {
    return (
        <>
            <Box
                display='flex'
                justifyContent='space-between'
                flexDirection='column'
                className='search-header'
            >
                <div style={{ fontSize: '1', color: 'var(--faceDeep)' }}>
                    {'Search Pairings'}
                </div>
                &nbsp;
                <PoolSearch setPoolId={setPoolId} />
                {/* <div className='transaction-settings'>
                    <FontAwesomeIcon icon={faCog} />
                </div> */}
            </Box>
        </>
    );
};

const TransactionSettings = ({
    gasPrices,
}: {
    gasPrices: EthGasPrices | null;
}) => {
    // TODO why does TS think this could be undefined ?
    const { selectedGasPrice, setSelectedGasPrice } = useContext(
        LiquidityContext,
    );

    // TODO show loader only for prices
    const isStandardActive = selectedGasPrice === GasPriceSelection.Standard;
    const isFastActive = selectedGasPrice === GasPriceSelection.Fast;
    const isFastestActive = selectedGasPrice === GasPriceSelection.Fastest;

    return (
        <div style={{ padding: '1rem', paddingTop: '0' }}>
            <p style={{ marginBottom: '1rem' }}>Select Transaction Speed</p>
            {setSelectedGasPrice && (
                <Box
                    display='flex'
                    alignItems='center'
                    justifyContent='space-between'
                    className='transaction-speed'
                >
                    <div
                        className={classNames({ active: isStandardActive })}
                        onClick={() =>
                            setSelectedGasPrice(GasPriceSelection.Standard)
                        }
                    >
                        {isStandardActive && (
                            <FontAwesomeIcon icon={faCheckCircle} />
                        )}
                        <span>
                            Standard{' '}
                            {gasPrices?.standard ?? <ThreeDots width='24px' />}{' '}
                            Gwei
                        </span>
                    </div>
                    <div
                        className={classNames({ active: isFastActive })}
                        onClick={() =>
                            setSelectedGasPrice(GasPriceSelection.Fast)
                        }
                    >
                        {isFastActive && (
                            <FontAwesomeIcon icon={faCheckCircle} />
                        )}
                        <span>
                            Fast {gasPrices?.fast ?? <ThreeDots width='24px' />}{' '}
                            Gwei
                        </span>
                    </div>
                    <div
                        className={classNames({ active: isFastestActive })}
                        onClick={() =>
                            setSelectedGasPrice(GasPriceSelection.Fastest)
                        }
                    >
                        {isFastestActive && (
                            <FontAwesomeIcon icon={faCheckCircle} />
                        )}
                        <span>
                            Fastest{' '}
                            {gasPrices?.fastest ?? <ThreeDots width='24px' />}{' '}
                            Gwei
                        </span>
                    </div>
                </Box>
            )}
        </div>
    );
};

export const LiquidityContainer = ({
    gasPrices,
}: {
    gasPrices: EthGasPrices | null;
}): JSX.Element => {
    const { data: pools, isLoading: isTopPoolsLoading } = useTopPools();

    const [poolId, setPoolId] = useState<string | null>(null);
    const { wallet } = useWallet();
    const { data: pool } = usePoolOverview(wallet.network, poolId);
    const [slippageTolerance, setSlippageTolerance] = useState(3.0);
    const [selectedGasPrice, setSelectedGasPrice] = useState<GasPriceSelection>(
        GasPriceSelection.Fast,
    );
    const balances = useBalance({
        pool,
    });
    debug.poolId = poolId;
    debug.balances = balances;

    const { data: randomPool } = usePoolOverview(
        wallet.network,
        `0x4e3f5778bafe258e4e75786f38fa3f8be34ad7f2`,
    );
    const { data: nanaPool } = usePoolOverview(
        wallet.network,
        `0xea7ef4f39eb2320a0e23c8ce1131d2c3f67097fd`,
    );

    const randomPoolBalances = useBalance({ pool: randomPool });
    const nanaPoolBalances = useBalance({ pool: nanaPool });

    return (
        <LiquidityContext.Provider
            value={{
                poolId,
                setPoolId,
                selectedGasPrice,
                setSelectedGasPrice,
                slippageTolerance,
                setSlippageTolerance,
            }}
        >
            {randomPool && nanaPool && (
                <div className='liquidity-carousel-item'>
                    <Box className='liquidity-container'>
                        <AddLiquidityV3
                            pool={randomPool}
                            balances={randomPoolBalances}
                            gasPrices={gasPrices}
                        />
                    </Box>
                </div>
                // <Carousel centerMode>
                //     <div className='liquidity-carousel-item'>
                //         <Box className='liquidity-container'>
                //             <AddLiquidityV3
                //                 pool={nanaPool}
                //                 balances={nanaPoolBalances}
                //                 gasPrices={gasPrices}
                //             />
                //         </Box>
                //     </div>
                // </Carousel>
            )}
        </LiquidityContext.Provider>
    );
};

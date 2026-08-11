"""CME WTI (CL) contract economics used to convert a price-point spread
z-score signal into realistic P&L. Figures are illustrative/approximate
exchange + clearing schedule values, not live-fetched -- update from
CME's fee schedule before trusting the numbers for anything real."""

CONTRACT_SIZE_BBL = 1000
TICK_SIZE = 0.01          # $/bbl
TICK_VALUE = TICK_SIZE * CONTRACT_SIZE_BBL   # $10 per tick per contract

EXCHANGE_FEE_PER_CONTRACT = 1.50   # round-turn approx, exchange + clearing
SLIPPAGE_TICKS_PER_LEG = 1         # assumed fill slippage, one leg of a calendar spread
INITIAL_MARGIN_PER_CONTRACT = 6500  # rough SPAN-style margin, single outright


def calendar_spread_round_trip_cost(n_contracts: int = 1) -> float:
    """Cost of opening AND closing one calendar-spread position (2 legs x 2 sides)."""
    legs_per_round_trip = 4
    slippage_cost = SLIPPAGE_TICKS_PER_LEG * TICK_VALUE * legs_per_round_trip
    fee_cost = EXCHANGE_FEE_PER_CONTRACT * legs_per_round_trip
    return (slippage_cost + fee_cost) * n_contracts
